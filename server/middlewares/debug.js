const { matchedData } = require("express-validator");
const { httpError } = require("./errors");

const logger = (req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
  console.log(`Body: ${JSON.stringify(req.body)}`);
  console.log(`--------------------------------------------------`);
  next();
};

const logReq = (req, res, next) => {
  console.log(req.body, req.file);
  next();
};

const respondSuccess = (req, res) => {
  const idk = matchedData(req);
  console.log({ idk });
  res.json({ chats: "success" });
};

module.exports = {
  logger,
  logReq,
  respondSuccess,
};
