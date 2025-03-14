const constants = require("./constants");
const utils = require("./utils");
const config = require("./config");

exports.handler = async ({ body }) => {
  try {
    console.info(constants.LOGS.REQ, JSON.stringify(body));

    const folderPath = `${__dirname}/tmp/${Date.now()}`;

    //Creating a workspace folder
    utils.makeDir(folderPath);

    if (!(await utils.downloadStackData(config.STACK_DATA, folderPath)))
      return utils.lambdaResponse(
        constants.HTTP_STATUS.UNPROCESSABLE_REQ,
        constants.LOGS.DOWNLOAD_FAILED,
      );

    if (
      !(await utils.extractStackData(
        `${folderPath}/${config.DATAFILE_NAME}`,
        folderPath,
      ))
    )
      return utils.lambdaResponse(
        constants.HTTP_STATUS.UNPROCESSABLE_REQ,
        constants.LOGS.EXTARCT_FAILED,
      );

    return utils.lambdaResponse(constants.HTTP_STATUS.OK, "Lambda response!");
  } catch (error) {
    console.error(constants.ERROR_TEXTS.INTERNAL_ERROR, error);

    return utils.lambdaResponse(
      constants.HTTP_STATUS.INTERNAL_ERROR,
      constants.ERROR_TEXTS.INTERNAL_ERROR,
    );
  }
};
