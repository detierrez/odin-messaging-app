// const { strictAuthenticate, looseAuthenticate } = require("./passport");
const { validateId, validateLogin, validateSignup } = require("./validators");
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
    query: req.query,
  });
  next();
};

const strictAuthenticate = (req, res, next) => {
  const id = Number(req.query.id);
  if (id) {
    req.user = { id };
    return next();
  }
  throw new httpError(401);
};

module.exports = {
  logger,
  throw404,
  maskInternalErrors,
  sendError,
  httpError,
  strictAuthenticate,
  // looseAuthenticate,
  validateId,
  // validateLogin,
  // validateSignup,
};
