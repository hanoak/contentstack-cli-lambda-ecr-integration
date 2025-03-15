const fs = require("fs");
const { DownloaderHelper } = require("node-downloader-helper");
const shelljs = require("shelljs");
const extract = require("extract-zip");
const constants = require("../constants");
const config = require("../config");

const reqValidation = (method, body) => {
  const region = body?.region;
  const stackApiKey = body?.api_key;
  const mgToken = body?.management_token;

  if (method !== "POST") return false;

  if (
    !region ||
    !stackApiKey ||
    !mgToken ||
    typeof region !== "string" ||
    typeof stackApiKey !== "string" ||
    typeof mgToken !== "string"
  )
    return false;

  if (!constants.CONTENTSTACK_REGIONS.includes(region)) return false;

  return true;
};

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

const ExecuteShellCommand = async (cmd) => {
  try {
    console.info(constants.LOGS.SHELL_START, cmd);
    const stdout = await new Promise((resolve, reject) => {
      shelljs.exec(cmd, (code, stdout, stderr) => {
        console.log(constants.LOGS.SHELL_CODE, code);
        if (code > 0) reject(stderr || constants.LOGS.SHELL_FAILED);
        else resolve();
      });
    });
    console.info(constants.LOGS.SHELL_FINISHED, cmd);
    return stdout;
  } catch (error) {
    console.warn(error);
    throw error;
  }
};

const importStackContent = async (dataPath, region, stackApiKey, mgToken) => {
  try {
    console.info(constants.LOGS.IMPORT_START);

    const csdxPath = `node_modules/@contentstack/cli/bin/run.js`;

    await ExecuteShellCommand(`${csdxPath} config:set:region ${region}`);

    await ExecuteShellCommand(
      `${csdxPath} auth:tokens:add --alias managementToken --stack-api-key ${stackApiKey} --management --token ${mgToken} --yes`,
    );

    await ExecuteShellCommand(
      `${csdxPath} cm:stacks:import -a managementToken -d ${dataPath} -c './import-config.json'`,
    );

    console.info(constants.LOGS.IMPORT_FINISHED);

    return true;
  } catch (err) {
    console.error(constants.LOGS.IMPORT_FAILED);
    return false;
  }
};

module.exports = {
  reqValidation,
  lambdaResponse,
  makeDir,
  downloadStackData,
  extractStackData,
  ExecuteShellCommand,
  importStackContent,
};
