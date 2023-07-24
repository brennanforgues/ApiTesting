import { formatDateAsHanaDate } from "../common/dateExtensions";
import { TimeSpan } from "../common/stopwatch";

export interface CollateralPoolDetailsDto {
  collateralPositions: Position[];
  marketPositions: Position[];
  stagedTrades: StagedTrade[];
  availablePositions: AvailablePosition[];
  collateralMargin: CollateralMargin;
  callMoneySecurities: CallMoneySecurity[];
  collateralMix: any[];
}

export interface AvailablePosition {
  collateralAttribute: string;
  availableNominal: number;
  cleanPriceQc: number;
  collPledgedDirtyValueIncHaircutPoolCurrency: number;
  collPledgedQuantity: number;
  collPool: string;
  collReceivedDirtyValueIncHaircutPoolCurrency: number;
  collReceivedQuantity: number;
  cusip: null | string;
  dirtyMVIncludingHaircutPoolCurrency: number;
  dirtyMVPoolCurrency: number;
  dirtyMVQc: number;
  dirtyPriceQc: number;
  haircut: number;
  instrumentType: string;
  isin: null | string;
  programId: string;
  quotationCurrency: Currency;
  custody: string;
  repoMaturityDirtyValueIncHaircutPoolCurrency: number;
  repoMaturityQuantity: number;
  secId: string;
  securityName: string;
  settlementLocation: string | null;
  t1Nominal: number;
  t2Nominal: number;
  t3Nominal: number;
  restrictions: string[];
  recordDate: null;
  nextCouponDate: null | string;
  upcomingDivCpnDate: null | string;
  nextCorporateMeetingType: null;
  nextCorporateMeetingDate: null | string;
  previousCorporateMeetingType: null;
  previousCorporateMeetingDate: null;
  corporateMeetingDate: null | string;
  corporateMeetingType: null | string;
  isBlocking: boolean;
  dealLabel: string;
  fxRate: number;
  inflationFactor: number;
  marketValueIncludingHaircutFxHaircut: number;
  poolFactor: number;
  terminationCurrency: string;
  finalMaturityDate: Date | null;
}

export enum Currency {
  Aud = "AUD",
  CAD = "CAD",
  Chf = "CHF",
  Dkk = "DKK",
  Eur = "EUR",
  Gbp = "GBP",
  Nok = "NOK",
  Sek = "SEK",
  Usd = "USD",
}

export interface CallMoneySecurity {
  securityId: string;
  securityName: string;
  currency: Currency;
  securityType: string;
  collateralSecurityId: string;
  counterParty: string;
  portfolio: string;
  modelPortfolio: string;
  settlementDate: string;
  referenceRate: string;
  debitSpreadRate: number;
  creditSpreadRate: number;
  fixedRate: number;
  instrumentType: string;
}

export interface CollateralMargin {
  collateralProgramId: null;
  collateralPool: null;
  effectiveDate: string;
  manualAdjustment: null;
  brokerMargin: null;
  agreedMargin: null;
  disputedAmount: null;
}

export interface Position {
  accruedInterestQc: number;
  bps: number;
  cleanPriceLocal: number;
  cleanValueQc: number;
  collateralAttribute: null | string;
  collateralPool: string;
  cusip: null | string;
  custody: string;
  dirtyMarketValue: number;
  dirtyPoolCurrencyMarketValue: number;
  dirtyPriceQc: number;
  dirtyValueIncludingMarginPoolCurrency: number;
  dirtyValueQc: number;
  dirtyValueQcMarginPool: number;
  haircut: number;
  instrumentType: string;
  isin: null | string;
  margin: number;
  modelPortfolio: string;
  nominal: number;
  portfolio: string;
  positionType: string;
  programId: string;
  quoteCurrency: Currency;
  securityId: string;
  securityName: string;
  settlementLocation: string | null;
  underlyingSecurityId: null;
  underlyingCusip: null;
  underlyingIsin: null;
  underlyingNominal: number;
  underlyingDirtyValuePoolCurrency: number;
  securityType: string;
  legNum: number;
  tagName: string;
  compoundCode: null;
  allocatedNominal: number;
  marketValueIncludingHaircut: number;
  marketValueIncludingHaircutFxHaircut: number;
  terminationCurrency: string | null;
  inflationFactor: number;
  poolFactor: number;
}

export class CreateTradeRequest {
  constructor(public collateralProgramId: string, public collateralPool: string, public collateralTrades: CollateralTrade[], public tagName: string | null) {}
}

export interface CollateralTrade {
  collateralPool: string;
  collateralProgramId: string;
  createdBy: null;
  cusip: string;
  custody: string;
  dirtyPriceQc: number;
  errorMessages: any[];
  haircut: number;
  id: number;
  instrumentType: string;
  isin: string;
  lastModified: null;
  marketValueHaircut: number;
  marketValueQc: number;
  modelPortfolio: string;
  nominal: number;
  portfolio: string;
  quotationCurrency: string;
  securityId: string;
  settlementDate: string;
  settlementLocation: string;
  submitSscnet: boolean;
  tradeDate: string;
  transactionCode: string;
  unitizedMv: number;
  unitizedMvQc: number;
  counterParty: string;
  acadiaSoftPledged: boolean;
  counterpartyMvQc: null;
  counterpartyCollateralMvPoolCcy: null;
  marginAmpId: null;
  pledgeAmpId: null;
  terminationCurrency: string;
  marketValueIncludingHaircutFxHaircut: null;
  unitizedMvFxHaircut: null;
  tagName: string;
}

export interface StagedTrade {
  id: number;
  cusip: string;
  isin: string;
  securityId: string;
  tradeDate: string;
  settlementDate: string;
  transactionCode: string;
  nominal: number;
  modelPortfolio: string;
  collateralPool: string;
  custody: string;
  submitSscnet: boolean;
  portfolio: string;
  marketValueHaircut: number;
  marketValueQc: number;
  marketValuePc: number;
  quotationCurrency: Currency;
  haircut: number;
  settlementLocation: string;
  createdBy: string;
  created: string;
  lastModifiedBy: string;
  lastModified: string;
  collateralProgramId: string;
  unitizedMv: number;
  unitizedMvQc: number;
  dirtyPriceQc: number;
  instrumentType: string;
  counterParty: null;
  errorMessages: string[];
  marginAmpId: null;
  pledgeAmpId: null;
  counterpartyMvQc: null;
  counterpartyCollateralMvPoolCcy: null;
  terminationCurrency: string;
  marketValueIncludingHaircutFxHaircut: null;
  unitizedMvFxHaircut: null;
  isRestricted: boolean;
  tagName: string;
}

export function convertToCollateralTrade(position: AvailablePosition, nominal: number): CollateralTrade {
  const today = formatDateAsHanaDate(new Date());
  return {
    collateralPool: position.collPool,
    collateralProgramId: position.programId,
    createdBy: null,
    cusip: position.cusip || "",
    custody: position.custody,
    dirtyPriceQc: position.dirtyPriceQc,
    errorMessages: [],
    haircut: position.haircut,
    id: 0,
    instrumentType: position.instrumentType,
    isin: position.isin || "",
    lastModified: null,
    marketValueHaircut: position.dirtyMVIncludingHaircutPoolCurrency,
    marketValueQc: position.dirtyMVQc,
    modelPortfolio: "ARTFSLBA",
    nominal: nominal,
    portfolio: "RPP",
    quotationCurrency: position.quotationCurrency,
    securityId: position.secId,
    settlementDate: today,
    settlementLocation: position.settlementLocation || "",
    submitSscnet: false,
    tradeDate: today,
    transactionCode: "DeliverCollateral",
    unitizedMv: position.collPledgedDirtyValueIncHaircutPoolCurrency,
    unitizedMvQc: position.collPledgedQuantity,
    counterParty: "",
    acadiaSoftPledged: false,
    counterpartyMvQc: null,
    counterpartyCollateralMvPoolCcy: null,
    marginAmpId: null,
    pledgeAmpId: null,
    terminationCurrency: position.terminationCurrency,
    marketValueIncludingHaircutFxHaircut: null,
    unitizedMvFxHaircut: null,
    tagName: "UNTAGGED",
  };
}

export interface StagedTrade {
  id: number;
  cusip: string;
  isin: string;
  securityId: string;
  tradeDate: string;
  settlementDate: string;
  transactionCode: string;
  nominal: number;
  modelPortfolio: string;
  collateralPool: string;
  custody: string;
  submitSscnet: boolean;
  portfolio: string;
  marketValueHaircut: number;
  marketValueQc: number;
  marketValuePc: number;
  quotationCurrency: Currency;
  haircut: number;
  settlementLocation: string;
  createdBy: string;
  created: string;
  lastModifiedBy: string;
  lastModified: string;
  collateralProgramId: string;
  unitizedMv: number;
  unitizedMvQc: number;
  dirtyPriceQc: number;
  instrumentType: string;
  counterParty: null;
  errorMessages: string[];
  marginAmpId: null;
  pledgeAmpId: null;
  counterpartyMvQc: null;
  counterpartyCollateralMvPoolCcy: null;
  terminationCurrency: string;
  marketValueIncludingHaircutFxHaircut: null;
  unitizedMvFxHaircut: null;
  isRestricted: boolean;
  tagName: string;
}

export class SubmitStagedTradesRequest {
  collateralTradesCsv: string = "";
  cashTradesCsv: string = "";
  tagName: string = "";
  constructor(public collateralProgramId: string, public collateralPool: string, public tradeIds: number[], public collateralPositions: Position[]) {}
}

export class DeleteStagedTradesRequest {
  tagName: string = "";
  constructor(public collateralProgramId: string, public collateralPool: string, public tradeIds: number[]) {}
}

export class IterationInfo {
  "Iteration #": number;
  "Users Count": number;
  "Trades Count": number;
  "Time to stage": string;
  "Time to submit": string;
  "Trade processing time": string;
  "Error?": string | undefined;

  constructor(iteration: number, usersCount: number, tradesCount: number, timeToStage: TimeSpan, timeToSubmit: TimeSpan, tradeProcessingTime: TimeSpan, error?: string) {
    this["Trade processing time"] = tradeProcessingTime.format('mm:ss');
    this["Users Count"] = usersCount;
    this["Iteration #"] = iteration;
    this["Trades Count"] = tradesCount;
    this["Time to stage"] = timeToStage.format('mm:ss');
    this["Time to submit"] = timeToSubmit.format('mm:ss');
    this["Error?"] = error;
  }
}
