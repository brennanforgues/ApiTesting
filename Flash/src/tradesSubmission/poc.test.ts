import { check, sleep, fail } from "k6";
import { Counter, Trend } from "k6/metrics";
import http from "k6/http";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.2/index.js";
import exec from "k6/execution";
import { getFormattedDate } from "../common/dateExtensions";
import Logger from "../common/logger";

let cid = 1;

const tradesTrend = new Trend("trades_trend");

const iters = 5;

export const options = {
  iterations: iters, // should be equal to the number of stages
};

const logger = new Logger({ fileName: `logs/output_${getFormattedDate()}.log`, consoleOutput: true });

let counter = 1;
export default function () {
  logger.info("woohoo");
  //console.log(`Getting data with id ${cid}, count: ${counter}`);
  const response = http.get(`https://test-api.k6.io/public/crocodiles/${cid}`);
  if (response.status !== 200) fail(`Failed to retrieve data: ${response.error}`);
  counter++;
  tradesTrend.add(exec.instance.iterationsCompleted + 1, { trades: "500", sid: "boohoo" });
}

export function handleSummary(data) {
  console.log("Trend", tradesTrend);

  const metrics = [
    { tradesCount: 100, totalTime: 200 },
    { tradesCount: 200, totalTime: 500 },
  ];

  //data["custom"] = metrics;

  const fileName = `test_results/summary_${options.vus ?? "1"}_${getFormattedDate()}`;

  const result = {
    //[`${fileName}.json`]: "hi", //JSON.stringify(data, null, 2),
    //stdout: JSON.stringify(data, null, 2),
    //stdout: textSummary(data, { indent: " ", enableColors: true }),
    //stdout: data, //JSON.stringify(metrics, null, 2),
    "summary.csv": convertToCSV(metrics),
  };

  console.log("result", result);

  return result;
}

function convertToCSV(arr) {
  const array = [Object.keys(arr[0])].concat(arr);

  return array
    .map((it) => {
      return Object.values(it)
        .map((value) => `"${value}"`)
        .join(",");
    })
    .join("\n");
}

//k6 run  --logformat=raw --http-debug=full -e FLASH_USERNAME=etsarovski@hoopp.com -e FLASH_PASSWORD=abc  -e SID="AAL US" .\dist\tradesSubmission.test.js 2> output.txt`
// k6 run -e FLASH_USERNAME=etsarovski@hoopp.com -e FLASH_PASSWORD=abc  -e SID="AAL US" .\dist\tradesSubmission.test.js
