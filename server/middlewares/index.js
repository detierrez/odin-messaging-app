// const { strictAuthenticate, looseAuthenticate } = require("./passport");
// const { validateId, validateLogin, validateSignup } = require("./validators");
const {
  httpError,
  throw404,
  maskInternalErrors,
  sendError,
} = require("./errorHandlers");

const logger = (req, res, next) => {
  console.log("Incoming request:", {
    url: req.url,
    body: req.body,
  });
  next();
};

module.exports = {
  logger,
  throw404,
  maskInternalErrors,
  sendError,
  httpError,
  // strictAuthenticate,
  // looseAuthenticate,
  // validateId,
  // validateLogin,
  // validateSignup,
};
