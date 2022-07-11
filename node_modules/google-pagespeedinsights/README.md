# google-pagespeedinsights
Analyze with PageSpeed Insights. Get your PageSpeed score and use PageSpeed suggestions to make your web site faster. Using [google-pagespeedinsights](https://www.npmjs.com/package/google-pagespeedinsights) you can get the page speed report as json output for multiple urls.

You can get an API key from [Google Developers Console](https://console.developers.google.com/).

Run the below command on your terminal to install google-pagespeedinsights.

```JavaScript

npm i google-pagespeedinsights

```

## How to use google-pagespeedinsights

Create a sample file with object, and the object contians the required parameter url and key for page speed. Rest of the parameters are optional.
[Click Here to see](https://github.com/eesakky/pagespeedinsights/blob/master/sample/sample.js) the sample file for test. 

```JavaScript

const psi = require('google-pagespeedinsights');

options = {
    urls: [
      "https://www.google.co.in",
      "https://www.youtube.com"
    ],
    apiVersion: "v5",
    strategy: "mobile"
}

psi(options);

```

## List of parameters

**Required query parameter**                                                            

**url < string >**

The URL to fetch and analyze                     

## Optional query parameters                                                           

**category < string >**

A Lighthouse category to run; if none are given, 
only Performance category will be run           
                                    
Acceptable values are:                      
* accessibility                             
* best-practices                            
* performance                               
* pwa                                       
* seo                                       

**locale < string >**	      

The locale used to localize formatted results     

**strategy < string >**	 

The analysis strategy (desktop or mobile) to use,
and desktop is the default                        

Acceptable values are:                       
* desktop: Fetch and analyze the URL         
for desktop browsers                       
* mobile : Fetch and analyze the URL         
for mobile devices                         

**utm_campaign < string >**
Campaign name for analytics.                     

**utm_source < string >**
Campaign source for analytics.                    


## Response

If successful, this package will returns a response body with the following structure:
[Click Here to see](https://github.com/eesakky/pagespeedinsights/blob/master/sample/sample-output.json) the sample json output. 

``` json

{
  "captchaResult": string,
  "kind": "pagespeedonline#result",
  "id": string,
  "loadingExperience": {
    "id": string,
    "metrics": {
      (key): {
        "percentile": integer,
        "distributions": [
          {
            "min": integer,
            "max": integer,
            "proportion": double
          }
        ],
        "category": string
      }
    },
    "overall_category": string,
    "initial_url": string
  },
  "originLoadingExperience": {
    "id": string,
    "metrics": {
      (key): {
        "percentile": integer,
        "distributions": [
          {
            "min": integer,
            "max": integer,
            "proportion": double
          }
        ],
        "category": string
      }
    },
    "overall_category": string,
    "initial_url": string
  },
  "lighthouseResult": {
    "requestedUrl": string,
    "finalUrl": string,
    "lighthouseVersion": string,
    "userAgent": string,
    "fetchTime": string,
    "environment": {
      "networkUserAgent": string,
      "hostUserAgent": string,
      "benchmarkIndex": double
    },
    "runWarnings": [
      (value)
    ],
    "configSettings": {
      "emulatedFormFactor": string,
      "locale": string,
      "onlyCategories": (value),
      "onlyCategories": (value)
    },
    "audits": {
      (key): {
        "id": string,
        "title": string,
        "description": string,
        "score": (value),
        "score": (value),
        "scoreDisplayMode": string,
        "displayValue": string,
        "explanation": string,
        "errorMessage": string,
        "warnings": (value),
        "warnings": (value),
        "details": {
          (key): (value)
        }
      }
    },
    "categories": {
      (key): {
        "id": string,
        "title": string,
        "description": string,
        "score": (value),
        "score": (value),
        "manualDescription": string,
        "auditRefs": [
          {
            "id": string,
            "weight": double,
            "group": string
          }
        ]
      }
    },
    "categoryGroups": {
      (key): {
        "title": string,
        "description": string
      }
    },
    "runtimeError": {
      "code": string,
      "message": string
    },
    "timing": {
      "total": double
    },
    "i18n": {
      "rendererFormattedStrings": {
        "varianceDisclaimer": string,
        "opportunityResourceColumnLabel": string,
        "opportunitySavingsColumnLabel": string,
        "errorMissingAuditInfo": string,
        "errorLabel": string,
        "warningHeader": string,
        "auditGroupExpandTooltip": string,
        "passedAuditsGroupTitle": string,
        "notApplicableAuditsGroupTitle": string,
        "manualAuditsGroupTitle": string,
        "toplevelWarningsMessage": string,
        "scorescaleLabel": string,
        "crcLongestDurationLabel": string,
        "crcInitialNavigation": string,
        "lsPerformanceCategoryDescription": string,
        "labDataTitle": string
      }
    }
  },
  "analysisUTCTimestamp": string,
  "version": {
    "major": integer,
    "minor": integer
  }
}

```