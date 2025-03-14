//SERVER.JS IS ONLY FOR THE LOCAL SETUP TO EMULATE LAMBDA ENVIRONMENT.

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const lambda = require("./index");

const PORT = 5000;
const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

app.use("/", (req, res) => {
  const event = {
    queryStringParameters: req?.query,
    body: req?.body,
    httpMethod: req.method,
  };

  lambda.handler(event).then((response) => {
    res.set(response?.headers);
    res.status(response?.statusCode).json(JSON.parse(response?.body || "{}"));
  });
});

app.use((err, _req, res, _next) => {
  console.error(`Express Error in localhost:${PORT}`);
  console.error(err);
  res.status(500).send("Something went wrong!");
});

app.listen(PORT, () => {
  console.info(`Server listening at port ${PORT}`);
});
