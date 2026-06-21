// const { strictAuthenticate, looseAuthenticate } = require("./passport");
const validators = require("./validators");
const { parseAvatar, parseAttachment } = require("./multer");
const { uploadAvatar, uploadAttachment } = require("./cloudinary");
const {
  httpError,
  throw404,
  maskInternalErrors,
  sendError,
} = require("./errorHandlers");

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
  logReq,
  throw404,
  maskInternalErrors,
  sendError,
  httpError,
  strictAuthenticate,
  // looseAuthenticate,
  validators,
  parseAvatar,
  uploadAvatar,
  parseAttachment,
  uploadAttachment,
};
