const constants = require("../constants");

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

module.exports = {
  lambdaResponse,
};
