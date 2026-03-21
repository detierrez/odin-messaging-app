const { STATUS_CODES } = require("http");

class httpError extends Error {
  constructor(status, cause) {
    super(STATUS_CODES[status], { cause });
    this.status = status;
  }
}

const throw404 = (req, res) => {
  throw new httpError(404);
};

const maskInternalErrors = (err, req, res, next) => {
  console.log(err); // Log original error

  if (err instanceof httpError) {
    // App errors
    return next(err);
  }
  if (err.name.match(/^PrismaClient.*$/)) {
    // DB error
    throw new httpError(502);
  }
  // Any other unknown error
  throw new httpError(500);
};

const sendError = (err, req, res, next) => {
  const { status, cause } = err;
  res.status(status).json({ cause });
};

module.exports = { httpError, throw404, maskInternalErrors, sendError };
