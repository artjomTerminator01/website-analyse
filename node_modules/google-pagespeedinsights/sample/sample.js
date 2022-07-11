const psi = require("../index.js");

options = {
    urls: [
      "https://www.google.co.in",
      "https://www.youtube.com"
    ],
    apiVersion: "v4",
    strategy: "mobile"
}

psi(options);
