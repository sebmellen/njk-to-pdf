import * as nunjucks from 'nunjucks';
import axios from 'axios';
import isHTML from 'is-html';

interface njkToPdfParams {
  apiKey: string;
  njkTemplate: string;
  jsonData: Record<string, unknown>;
  fileName: string;
  presignedUploadUrl: string;
}

export function njkToPdf(params: njkToPdfParams): Promise<boolean> {
  // Render the NJK template with the data
  nunjucks.configure({ autoescape: true });
  const outputHtml = nunjucks.renderString(params.njkTemplate, params.jsonData);

  // Verify that the output is valid HTML
  if (!isHTML(outputHtml)) {
    throw new Error('Template did not render valid HTML');
  }

  // Define the POST body
  const requestBody = {
    html: outputHtml,
    inline: true,
    fileName: params.fileName,
    options: {
      delay: 0,
      puppeteerWaitForMethod: 'WaitForNavigation',
      puppeteerWaitForValue: 'Load',
      usePrintCss: true,
      landscape: false,
      printBackground: true,
      displayHeaderFooter: false,
      headerTemplate: '<span></span>',
      footerTemplate: '<span></span>',
      width: '8.27in',
      height: '11.69in',
      marginTop: '.4in',
      marginBottom: '.4in',
      marginLeft: '.4in',
      marginRight: '.4in',
      pageRanges: '1-10000',
      scale: 1,
      omitBackground: false,
    },
    useCustomStorage: true,
    storage: {
      method: 'PUT',
      url: params.presignedUploadUrl,
      extraHTTPHeaders: {},
    },
  };

  // Define the options for the POST request
  const requestOptions = {
    url: 'https://v2.njkToPdf.com/chrome/pdf/html',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: params.apiKey,
    },
    body: JSON.stringify(requestBody),
  };

  // Make the POST request and return a promise that resolves with the 'Success' field
  return axios(requestOptions)
    .then(response => {
      if (!response.data.Success) {
        console.error('Request failed: ', response.data);
        throw new Error('Api2Pdf request was unsuccessful');
      } else {
        return response.data.Success;
      }
    })
    .catch(err => {
      console.error('Request failed: ', err);
      throw err;
    });
}
