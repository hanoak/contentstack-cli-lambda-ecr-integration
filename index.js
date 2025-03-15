const constants = require("./constants");
const utils = require("./utils");
const config = require("./config");

exports.handler = async ({ body }) => {
  try {
    console.info(constants.LOGS.REQ, JSON.stringify(body || {}));

    const workspacePath = `${__dirname}/tmp/${Date.now()}`;

    //Creating a workspace folder
    utils.makeDir(workspacePath);

    //Download Stack content
    if (!(await utils.downloadStackData(config.STACK_DATA, workspacePath)))
      return utils.lambdaResponse(
        constants.HTTP_STATUS.UNPROCESSABLE_REQ,
        constants.LOGS.DOWNLOAD_FAILED,
      );

    //Extract stack content
    if (
      !(await utils.extractStackData(
        `${workspacePath}/${config.DATAFILE_NAME}`,
        workspacePath,
      ))
    )
      return utils.lambdaResponse(
        constants.HTTP_STATUS.UNPROCESSABLE_REQ,
        constants.LOGS.EXTARCT_FAILED,
      );

    //Import stack content
    if (
      !(await utils.importStackContent(
        `${workspacePath}/${config.EXTRACT_FOLDER}/main`,
        body?.region,
        body?.api_key,
        body?.management_token,
      ))
    )
      return utils.lambdaResponse(
        constants.HTTP_STATUS.UNPROCESSABLE_REQ,
        constants.LOGS.IMPORT_FAILED,
      );

    return utils.lambdaResponse(
      constants.HTTP_STATUS.OK,
      constants.LOGS.REQ_SUCCESS,
    );
  } catch (error) {
    console.error(constants.ERROR_TEXTS.INTERNAL_ERROR, error);

    return utils.lambdaResponse(
      constants.HTTP_STATUS.INTERNAL_ERROR,
      constants.ERROR_TEXTS.INTERNAL_ERROR,
    );
  }
};
