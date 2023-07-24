import { fail, sleep } from "k6";
import { AvailablePosition, CollateralPoolDetailsDto, CollateralTrade, CreateTradeRequest, DeleteStagedTradesRequest, IterationInfo, Position, StagedTrade, SubmitStagedTradesRequest, convertToCollateralTrade } from "./models";
import exec from "k6/execution";

import CSVWriter from "../common/csvWriter";
import { formatDate } from "../common/dateExtensions";
import flashClient, { Response } from "../common/flashClient";
import Logger from "../common/logger";
import { Stopwatch, TimeSpan } from "../common/stopwatch";

const flashUri = "http://flashqa1"; //"http://localhost:60746"; //

const tradesCounts = [1,1]; //50, 100, 500, 1000, 1999, 1 // 5000, 10000, 25000 - can't test because compliance doesn't support it.

const collateralProgramId = "SECFIN";
const collateralPool = "SEB SECFIN";

const getCollateralPoolDetailsUrl = `${flashUri}/Api/CollateralApi/GetCollateralPoolDetails?collateralProgramId=${collateralProgramId}&collateralPool=${encodeURIComponent(collateralPool)}&tagName=ALL`;
const createUpdateTradesUrl = `${flashUri}/Api/CollateralApi/CreateOrUpdateTrades`;
const submitTradesUrl = `${flashUri}/Api/CollateralApi/SubmitTrades`;
const deleteTradesUrl = `${flashUri}/Api/CollateralApi/DeleteTrades`;

export const options = {
  duration: "45m", // will fail in 10 or so minutes if not set
  thresholds: {},
  iterations: tradesCounts.length,
  vus: 1,
};
export default function () {
  const yyyymmdd = formatDate("yyyymmdd");
  const resultsLogger = new Logger({ fileName: `test_results/results_${options.vus ?? "1"}_${yyyymmdd}.txt`, consoleOutput: false });
  const logger = new Logger({ fileName: `logs/${yyyymmdd}.log`, consoleOutput: true });
  const csv = new CSVWriter(`test_results/results_${options.vus ?? "1"}_${yyyymmdd}.csv`);

  const tradesCount = tradesCounts[exec.instance.iterationsCompleted];

  logger.info(`--- Starting a test with ${tradesCount} trades; iteration ${exec.instance.iterationsCompleted + 1} of ${tradesCounts.length}`);

  const cp = getCollateralPoolDetails();
  logger.info(`Retrieved collateral pool details. Available positions: ${cp.availablePositions.length}`);
  const tradeReq = createTradesRequest(cp.availablePositions, tradesCount, 1, logger);
  logger.info(`Created trade request with following securities (${tradeReq.collateralTrades.length}): ${tradeReq.collateralTrades.map((x) => x.securityId).join(", ")}`);

  let stagedTrades: StagedTrade[] = [];
  let stagingTime = TimeSpan.empty,
    submitTime = TimeSpan.empty,
    processingTime = TimeSpan.empty;

  try {
    
    logger.info('Stage - start', new Date().toTimeString(), exec.vu.idInTest);
    let sw = Stopwatch.start();
    stagedTrades = stageTrades(tradeReq, logger);
    stagingTime = sw.elapsed();
    logger.info(`Staged trades in ${stagingTime.format("ss.fff")}s`);

    if (!stageTrades?.length) {
      logger.warn("No trades were staged, quitting.");
      return;
    }

    sw.restart();
    logger.info('Submit - start', new Date().toTimeString(), exec.vu.idInTest);
    submitTrades(stagedTrades, cp.collateralPositions);
    submitTime = sw.elapsed();
    logger.info('Submit - done', new Date().toTimeString(), exec.vu.idInTest);

    sw.restart();
    waitForTradesProcessed(stagedTrades, logger);
    processingTime = sw.elapsed();
  } catch (err) {
    logger.error("Failed", err);
    throw err;
  } finally {
    const iteration = new IterationInfo(exec.instance.iterationsCompleted + 1, options.vus ?? 1, stagedTrades.length, stagingTime, submitTime, processingTime);
    resultsLogger.info(iteration);
    logger.info("Completed iteration: ", iteration);

    csv.write(iteration);

    if (stageTrades.length > 0) {
      deleteTrades(stagedTrades); // cleanup
    }
  }
}

function getCollateralPoolDetails(): CollateralPoolDetailsDto {
  const getCpResponse = flashClient.get<CollateralPoolDetailsDto>(getCollateralPoolDetailsUrl);
  if (getCpResponse.status !== 200) fail(`Failed to retrieve CollateralPoolDetails: ${getCpResponse.error}`);
  return getCpResponse.body;
}

// Go over available positions and create a trade with unique tickers. Can have multiple trades per ticker if tradesCountReqd > AP count
function createTradesRequest(availablePositions: AvailablePosition[], tradesCountReqd: number, reqNominal: number = 1, logger: Logger): CreateTradeRequest {
  let collTrades: CollateralTrade[] = [];

  const apsWithNominal = availablePositions.filter((x) => x.availableNominal >= reqNominal * 10);
  // Ensure that we don't try to create more trades than available positions
  if (tradesCountReqd > apsWithNominal.length) {
    logger.warn(`Requested ${tradesCountReqd} trade, but we only have ${apsWithNominal.length} available positions.`);
    tradesCountReqd = apsWithNominal.length;
  }

  for (let i = 0; i < tradesCountReqd; i++) {
    const pos = { ...apsWithNominal[i] };
    const req = convertToCollateralTrade(pos, reqNominal);
    collTrades.push(req);
    pos.availableNominal -= reqNominal;
  }

  const result = new CreateTradeRequest(collateralProgramId, collateralPool, collTrades, null);
  return result;
}

function stageTrades(createTradesRequest: CreateTradeRequest, logger: Logger): StagedTrade[] {
  let createTradesResponse: Response<CollateralPoolDetailsDto>;

  createTradesResponse = flashClient.post<CollateralPoolDetailsDto>(createUpdateTradesUrl, createTradesRequest);
  if (createTradesResponse.status !== 200) throw `Failed while staging trades: ${createTradesResponse.error}`;

  const stagingErrors = createTradesResponse.body.stagedTrades.filter((x) => x.errorMessages != null && x.errorMessages.length > 0 && createTradesRequest.collateralTrades.find((ct) => ct.securityId == x.securityId));
  if (!!stagingErrors?.length) logger.warn(`Staged with errors. Failed securities (${stagingErrors.length}): ${stagingErrors.map((x) => x.securityId).join(", ")}`);

  // find staged trades that are a result of trade request
  const result: StagedTrade[] = [];

  const staged = createTradesResponse.body.stagedTrades;
  for (const ct of createTradesRequest.collateralTrades) {
    const st = staged.find((x) => x.securityId == ct.securityId && x.nominal == ct.nominal && !x.errorMessages?.length);
    if (!!st) {
      result.push(st);
    }
  }

  return result;
}

function submitTrades(stagedTrades: StagedTrade[], collateralPositions: Position[]) {
  const stagedTradesIds = stagedTrades.map((x) => x.id);
  const submitTradesReq = new SubmitStagedTradesRequest(collateralProgramId, collateralPool, stagedTradesIds, collateralPositions);
  const submitTradesResponse = flashClient.post<CollateralPoolDetailsDto>(submitTradesUrl, submitTradesReq);
  if (submitTradesResponse.status !== 200) fail(`Failed while submitting trades: ${submitTradesResponse.error}`);
}

function waitForTradesProcessed(stagedTrades: StagedTrade[], logger: Logger): number {
  const checkDelaySeconds = 10;
  let startTime = Date.now();
  let counter = 0;

  while (true) {
    counter++;
    sleep(checkDelaySeconds);
    logger.info(`Polling for updated trades. Attempt #${counter}`);
    const cpd = getCollateralPoolDetails();
    console.log("Poll complete, checking....");
    const cps = cpd.collateralPositions;

    if (stagedTrades.every((st) => !!cps.find((cp) => cp.securityId == st.securityId))) {
      break;
    }
  }
  logger.info(`Received processed trades`);
  const duration = (Date.now() - startTime) / 1000;
  return duration;
}

function deleteTrades(stagedTrades: StagedTrade[]) {
  const chunkSize = 2000;
  const stagedTradesIds = stagedTrades.map((x) => x.id);

  // Break trades into chunks
  for (let i = 0; i < stagedTradesIds.length; i += chunkSize) {
    const chunkedTradeIds = stagedTradesIds.slice(i, i + chunkSize);
    const deleteTradesReq = new DeleteStagedTradesRequest(collateralProgramId, collateralPool, chunkedTradeIds);

    const deleteTradesResponse = flashClient.post<CollateralPoolDetailsDto>(deleteTradesUrl, deleteTradesReq);
    if (deleteTradesResponse.status !== 200) fail(`Failed while deleting trades: ${deleteTradesResponse.error}`);
  }
}

// To run:
// yarn install   (once to install dependencies)
// yarn webpack
// k6 run --logformat=raw -e FLASH_USERNAME=your-user-name@hoopp.com -e FLASH_PASSWORD=your-hoopp-password --vus number-of-users .\dist\tradesSubmission.test.js
// Set tradesCounts before running webpack. tradesCounts's length should be same as number-of-users, e.g. --vus 3, const tradesCounts = [100,100, 100] (each user runs a trade with 100 tickers)