const {
  param,
  query,
  body,
  validationResult,
  oneOf,
} = require("express-validator");
const prisma = require("../lib/prisma");
const { httpError } = require("./errorHandlers");

function required(fields) {
  return body(fields)
    .trim()
    .exists({ values: "falsy" })
    .withMessage("is required");
}

function throwErrors(req, res, next) {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const cause = errors.array({ onlyFirstError: true }).map((err) => {
    const { location, path, value, msg } = err;
    return { location, field: path, value, reason: msg };
  });

  throw new httpError(400, cause);
}

const validateId = (key) => {
  return [param(key).isInt().toInt(), throwErrors];
};

const validateLogin = [required(["username", "password"]), throwErrors];

const validateSignup = [
  required(["username", "password"]),
  body("username").custom(async (username) => {
    const user = await prisma.user.findUnique({ where: { username } });
    if (user) throw new Error("already exists");
  }),
  body("password")
    .isLength({ min: 8 })
    .withMessage("must be at least 8 characters long"),
  throwErrors,
];

module.exports = {
  validateId,
  validateLogin,
  validateSignup,
};
