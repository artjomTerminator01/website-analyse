const csv = require("csv-parser");
const fs = require("fs");
const fetch = require("node-fetch");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const results = [];
const correct = [];
const bugged = [];
const webSiteHashMap = new Map();

let readStream = fs.createReadStream("./data/source/source.csv");
readStream
  .pipe(csv({}))
  .on("data", (data) => {
    results.push(data);
  })
  .on("end", () => {
    getInfo(results);
  });

async function getInfo(results) {
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    try {
      if (webSiteHashMap.has(result.Website)) {
        const sameSite = webSiteHashMap.get(result.Website);
        result.score = sameSite.score;
        result.blockingTime = sameSite.blockingTime;
        result.firstContentfulPaint = sameSite.firstContentfulPaint;
        result.speedIndex = sameSite.speedIndex;
        result.largestContentfulPaint = sameSite.largestContentfulPaint;
        result.timeToInteractive = sameSite.timeToInteractive;
        result.cumulativeLayoutShift = sameSite.cumulativeLayoutShift;
        result.status = "Successful";
        correct.push(result);
      } else {
        const response = await fetch(result.Website);
        if (!response.ok) {
          result.status = "Response not OK";

          bugged.push(result);
        } else {
          console.log(result.Website + "response.status: ", response.status);
          if (response.status == 200) {
            await fetch(
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
                const cumulativeLayoutShift = getNestedObject(out, [
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
                  cumulativeLayoutShift
                );

                const filtered = objectParams.filter((el) => {
                  return el !== undefined;
                });
                if (filtered.length < 7) {
                  bugged.push(result);
                  result.status = "Bugged";
                } else {
                  webSiteHashMap.set(result.Website, {
                    score: score,
                    blockingTime: blockingTime,
                    firstContentfulPaint: firstContentfulPaint,
                    speedIndex: speedIndex,
                    largestContentfulPaint: largestContentfulPaint,
                    timeToInteractive: timeToInteractive,
                    cumulativeLayoutShift: cumulativeLayoutShift,
                  });
                  result.score = parseInt((score * 100).toFixed(2));
                  result.blockingTime = blockingTime;
                  result.firstContentfulPaint = firstContentfulPaint;
                  result.speedIndex = speedIndex;
                  result.largestContentfulPaint = largestContentfulPaint;
                  result.timeToInteractive = timeToInteractive;
                  result.cumulativeLayoutShift = cumulativeLayoutShift;
                  result.status = "Successful";
                  console.log(result);
                  correct.push(result);
                }
              })
              .catch((e) => {
                result.status = "Google fetch api fail!";
                bugged.push(result);
              });
          }
        }
      }
    } catch (e) {
      result.status = "Core fetch fail!";
      bugged.push(result);
    }
  }

  writeCsv(correct, "output.csv");
  writeCsv(bugged, "bugged.csv");
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
      { id: "firstContentfulPaint", title: "First Contentful Paint" },
      { id: "speedIndex", title: "Speed Index" },
      { id: "largestContentfulPaint", title: "Largest Contentful Paint" },
      { id: "timeToInteractive", title: "Time To Interactive" },
      { id: "blockingTime", title: "Blocking Time" },
      { id: "cumulativeLayoutShift", title: "Cumulative Layout Shift" },
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
