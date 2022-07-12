const csv = require("csv-parser");
const fs = require("fs");
const fetch = require("node-fetch");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const results = [];
const bugged = [];

fs.createReadStream("./data/source/source.csv")
  .pipe(csv({}))
  .on("data", (data) => {
    getInfo(data);
  });

async function getInfo(result) {
  try {
    const response = await fetch(result.Website);
    if (!response.ok) {
      bugged.push(result);
      result.status = "Response not OK";
      writeCsv(bugged, "bugged.csv");
    } else {
      console.log(result.Website + "response.status: ", response.status);
      if (response.status == 200) {
        fetch(
          "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=" +
            result.Website +
            "&key=AIzaSyCRXaJOfamgK29k-geKS9ByZh4PgPs7hfk"
        )
          .then((res) => res.json())
          .then((out) => {
            const objectParams = [];
            const score = getNestedObject(out, [
              "lighthouseResult",
              "categories",
              "performance",
              "score",
            ]);
            const blockingTime = getNestedObject(out, [
              "lighthouseResult",
              "audits",
              "total-blocking-time",
              "displayValue",
            ]);
            const firstContentfulPaint = getNestedObject(out, [
              "lighthouseResult",
              "audits",
              "first-contentful-paint",
              "displayValue",
            ]);
            const speedIndex = getNestedObject(out, [
              "lighthouseResult",
              "audits",
              "speed-index",
              "displayValue",
            ]);
            const largestContentfulPaint = getNestedObject(out, [
              "lighthouseResult",
              "audits",
              "largest-contentful-paint",
              "displayValue",
            ]);
            const timeToInteractive = getNestedObject(out, [
              "lighthouseResult",
              "audits",
              "interactive",
              "displayValue",
            ]);
            const cumulativeLayjoutShift = getNestedObject(out, [
              "lighthouseResult",
              "audits",
              "cumulative-layout-shift",
              "displayValue",
            ]);
            objectParams.push(
              score,
              blockingTime,
              firstContentfulPaint,
              speedIndex,
              largestContentfulPaint,
              timeToInteractive,
              cumulativeLayjoutShift
            );

            const filtered = objectParams.filter((el) => {
              return el !== undefined;
            });
            if (filtered.length < 7) {
              bugged.push(result);
              result.status = "Bugged";
              writeCsv(bugged, "bugged.csv");
            } else {
              result.score = parseInt((score * 100).toFixed(2));
              result.blockingTime = blockingTime;
              result.firstContentfulPaint = firstContentfulPaint;
              result.speedIndex = speedIndex;
              result.largestContentfulPaint = largestContentfulPaint;
              result.timeToInteractive = timeToInteractive;
              result.cumulativeLayoutShift = cumulativeLayjoutShift;
              result.status = "Successful";
              console.log(result);
              results.push(result);
              writeCsv(results, "output.csv");
            }
          })
          .catch((e) => {
            bugged.push(result);
            result.status = "Google fetch api fail!";
            writeCsv(bugged, "bugged.csv");
          });
      }
    }
  } catch (e) {
    bugged.push(result);
    result.status = "Core fetch fail!";
    writeCsv(bugged, "bugged.csv");
  }
  //process.exit(0);
}

function writeCsv(list, filename) {
  const csvWriter = createCsvWriter({
    path: "./data/output/" + filename,
    header: [
      { id: "FirstName", title: "First Name" },
      { id: "LastName", title: "Last Name" },
      { id: "Title", title: "Title" },
      { id: "Company", title: "Company" },
      { id: "Email", title: "Email" },
      { id: "MobilePhone", title: "Mobile Phone" },
      { id: "PersonLinkedinUrl", title: "Personal Linkedin Url" },
      { id: "Website", title: "Website" },
      { id: "Country", title: "Country" },
      { id: "score", title: "Score" },
      { id: "firstContentfulPaint", title: "FirstContentfulPaint" },
      { id: "speedIndex", title: "SpeedIndex" },
      { id: "largestContentfulPaint", title: "LargestContentfulPaint" },
      { id: "timeToInteractive", title: "TimeToInteractive" },
      { id: "blockingTime", title: "BlockingTime" },
      { id: "cumulativeLayoutShift", title: "CumulativeLayoutShift" },
      { id: "status", title: "Status" },
    ],
  });

  csvWriter.writeRecords(list);
}

const getNestedObject = (nestedObj, pathArr) => {
  return pathArr.reduce(
    (obj, key) => (obj && obj[key] !== "undefined" ? obj[key] : undefined),
    nestedObj
  );
};
