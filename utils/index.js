const fs = require("fs");
const { DownloaderHelper } = require("node-downloader-helper");
const extract = require("extract-zip");
const constants = require("../constants");
const config = require("../config");

const lambdaResponse = (statusCode, body, headers = {}) => {
  console.info(constants.LOGS.RES, statusCode);
  return {
    statusCode,
    headers: {
      "Content-type": "application/json",
      "Access-Control-Allow-Headers": "Content-Type",
      ...headers,
    },
    body: JSON.stringify(body),
  };
};

const makeDir = (path) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }
};

const downloadStackData = async (url, downloadPath) => {
  console.info(constants.LOGS.DOWNLOAD_START, url);

  try {
    await new Promise((resolve, reject) => {
      const download = new DownloaderHelper(url, downloadPath, {
        fileName: config.DATAFILE_NAME,
      });
      download.on("end", resolve);
      download.on("error", reject);
      download.start().catch(reject);
    });

    console.info(constants.LOGS.DOWNLOAD_COMPLETED);
    return true;
  } catch (err) {
    console.error(constants.LOGS.DOWNLOAD_FAILED, err);
    return false;
  }
};

const extractStackData = async (source, target) => {
  console.info(constants.LOGS.EXTRACT_STARTED);
  try {
    await extract(source, { dir: target });
    console.info(constants.LOGS.EXTRACT_COMPLETE);
    return true;
  } catch (err) {
    console.error(constants.LOGS.EXTARCT_FAILED, err);
    return false;
  }
};

module.exports = {
  lambdaResponse,
  makeDir,
  downloadStackData,
  extractStackData,
};
