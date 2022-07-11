const csv = require("csv-parser");
const fs = require("fs");
const fetch = require("node-fetch");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const results = [];

fs.createReadStream("./data/source/source.csv")
  .pipe(csv({}))
  .on("data", (data) => results.push(data))
  .on("end", () => {
    getInfo(results);
  });

function getInfo(results) {
  for (let i = 0; i < results.length; i++) {
    fetch(results[i].Website)
      .then((response) => {
        console.log(results[i].Website + "response.status: ", response.status);
        if (response.status == 200) {
          fetch(
            "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=" +
              results[i].Website +
              "&key=AIzaSyCRXaJOfamgK29k-geKS9ByZh4PgPs7hfk"
          )
            .then((res) => res.json())
            .then((out) => {
              const score = out.lighthouseResult.categories.performance.score;
              const blockingTime =
                out.lighthouseResult.audits["total-blocking-time"].displayValue;
              const firstContentfulPaint =
                out.lighthouseResult.audits["first-contentful-paint"]
                  .displayValue;
              const speedIndex =
                out.lighthouseResult.audits["speed-index"].displayValue;
              const largestContentfulPaint =
                out.lighthouseResult.audits["largest-contentful-paint"]
                  .displayValue;
              const timeToInteractive =
                out.lighthouseResult.audits["interactive"].displayValue;
              const cumulativeLayjoutShift =
                out.lighthouseResult.audits["cumulative-layout-shift"]
                  .displayValue;

              results[i].Score = parseInt((score * 100).toFixed(2));
              results[i].BlockingTime = blockingTime;
              results[i].FirstContentfulPaint = firstContentfulPaint;
              results[i].SpeedIndex = speedIndex;
              results[i].LargestContentfulPaint = largestContentfulPaint;
              results[i].TimeToInteractive = timeToInteractive;
              results[i].CumulativeLayoutShift = cumulativeLayjoutShift;
              console.log(results[i]);

              writeCsv(results);
            })
            .catch((e) => {
              console.log(e);
            });
          console.log("response OK");
        }
      })
      .catch((e) => {
        console.log(e);
      });
  }
}

function writeCsv(results) {
  const csvWriter = createCsvWriter({
    path: "./data/output/output.csv",
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
      { id: "Score", title: "Score" },
      { id: "FirstContentfulPaint", title: "FirstContentfulPaint" },
      { id: "SpeedIndex", title: "SpeedIndex" },
      { id: "LargestContentfulPaint", title: "LargestContentfulPaint" },
      { id: "TimeToInteractive", title: "TimeToInteractive" },
      { id: "BlockingTime", title: "BlockingTime" },
      { id: "CumulativeLayoutShift", title: "CumulativeLayoutShift" },
    ],
  });

  csvWriter.writeRecords(results);
}
