const { HttpError } = require("../lib/errors");

const throwNotFoundError = (req, res, next) => {
  return next(new HttpError(404));
};

const maskInternalErrors = (err, req, res, next) => {
  console.log(err); // Log original error

  if (err instanceof HttpError) {
    // Manually thrown errors
    return next(err);
  }
  if (err.name?.match(/^PrismaClient.*$/)) {
    // DB error
    throw new HttpError(502);
  }
  // Any other unknown error
  throw new HttpError(500);
};

const respondWithError = (err, req, res, next) => {
  res.status(err.body.code).json({ ...err.body });
};

module.exports = {
  throwNotFoundError,
  maskInternalErrors,
  respondWithError,
};
