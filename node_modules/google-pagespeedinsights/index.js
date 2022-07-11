const { google } = require('googleapis');
const isUrl = require('./lib/validateUrl.js');
const fs = require('fs');

module.exports = options => {
    const apiVersion = options.apiversion || 'v5';
    const  initPageSpeed = google.pagespeedonline(apiVersion)
    let collectedDataFromAPI = [];

    const psiData = options.urls.map( (url) => {
        if (!isUrl(url)) {
            return false;
        }

        return new Promise((resolve, reject) => {
          const getOptions = {
            url: url,
            key: options.key,
            strategy: options.strategy,
            category: options.category,
            locale: options.locale,
            utm_campaign: options.utm_campaign,
            utm_source: options.utm_source
          }

          return resolve (
            initPageSpeed.pagespeedapi.runpagespeed(getOptions)
              .then((report) => {
                collectedDataFromAPI.push(report.data);
              })
              .catch(error => {
                console.error('Report failed : '+ error);
              })
          );
        })
    });

    Promise.all(psiData).then(function() {
        if (psiData.includes(false)) {
            console.log(`\n Invalid url. Url must match the following regular expression: '(?i)http(s)?://.*' \n Please check your url list and try again \n`);
            return;
        };

        const dataForJson = JSON.stringify(collectedDataFromAPI);
        fs.writeFile('./report.json', dataForJson, 'utf8', (error) => { error != null ? console.log('Error' + error) : "" });
        console.log(`\n Report has been generated successfully \n`);
    })
}
