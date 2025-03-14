const constants = require("./constants");
const { lambdaResponse } = require("./utils");

exports.handler = async ({ body }) => {
  try {
    console.info(constants.LOGS.REQ, body);

    return lambdaResponse(constants.HTTP_STATUS.OK, "Lambda response!");
  } catch (error) {
    console.error(constants.ERROR_TEXTS.INTERNAL_ERROR, error);

    return lambdaResponse(
      constants.HTTP_STATUS.INTERNAL_ERROR,
      constants.ERROR_TEXTS.INTERNAL_ERROR,
    );
  }
};
