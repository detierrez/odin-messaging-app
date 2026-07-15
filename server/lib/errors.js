const { STATUS_CODES } = require("http");
const { toScreamingSnakeCase } = require("./utils");

class HttpError extends Error {
  constructor(code, messageOrErrors, { ...metadata } = {}) {
    const status = STATUS_CODES[code];
    super(status);
    this.body = {
      status: toScreamingSnakeCase(status),
      code,
      timestamp: new Date().toISOString(),
      errors: Array.isArray(messageOrErrors)
        ? messageOrErrors
        : [{ message: messageOrErrors, ...metadata }],
    };
  }
}

module.exports = { HttpError };
