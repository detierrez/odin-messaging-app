const {
  oneOf,
  check,
  param,
  query,
  body,
  matchedData,
  validationResult,
} = require("express-validator");
const prisma = require("../lib/prisma");
const { HttpError } = require("../lib/errors");

const NAME_MAX_LENGTH = 2 ** 6;
const DESCRIPTION_MAX_LENGTH = 2 ** 7;
const CONTENT_MAX_LENGTH = 2 ** 11;
const MIN_PASSWORD_LENGTH = 2 ** 3;
const MAX_PASSWORD_LENGTH = 2 ** 6;
const MIN_LIMIT = 1;
const MAX_LIMIT = 100;
const ALLOWED_ROLES = ["ADMIN", "MEMBER"];

const withUsernameValidation = (chain) =>
  chain
    .matches(/^[a-zA-Z].*/)
    .withMessage("username must start with a letter")
    .isAlphanumeric()
    .withMessage("username must only contain letters and numbers");

const requiredUsername = withUsernameValidation(
  body("username")
    .trim()
    .toLowerCase()
    .exists({ values: "falsy" })
    .withMessage("username is required"),
);

const optionalUsername = withUsernameValidation(
  body("username").trim().toLowerCase().optional({ values: "falsy" }),
);

const password = body("password")
  .exists({ values: "falsy" })
  .withMessage("password is required")
  .isLength({ min: MIN_PASSWORD_LENGTH, max: MAX_PASSWORD_LENGTH })
  .withMessage(
    `password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters long`,
  );

const alias = body("alias")
  .optional()
  .trim()
  .default(null)
  .isLength({ max: NAME_MAX_LENGTH })
  .withMessage(`Alias cannot exceed ${NAME_MAX_LENGTH} characters`);

const name = body("name")
  .optional()
  .trim()
  .default(null)
  .isLength({ max: NAME_MAX_LENGTH })
  .withMessage(`Name cannot exceed ${NAME_MAX_LENGTH} characters`);

const description = body("description")
  .optional()
  .trim()
  .default(null)
  .isLength({ max: DESCRIPTION_MAX_LENGTH })
  .withMessage(
    `Description cannot exceed ${DESCRIPTION_MAX_LENGTH} characters`,
  );

const aliasDescriptionOrAvatar = oneOf(
  [
    body("alias").exists({ values: "falsy" }),
    body("description").exists({ values: "falsy" }),
    check().custom((_, { req }) => req.avatarUrl),
  ],
  { message: "Either alias, description or avatar must be provided" },
);

const nameDescriptionOrAvatar = oneOf(
  [
    body("name").exists({ values: "falsy" }),
    body("description").exists({ values: "falsy" }),
    check().custom((_, { req }) => req.avatarUrl),
  ],
  { message: "Either name, description or avatar must be provided" },
);

const userId = body("userId")
  .optional({ values: "falsy" })
  .toInt()
  .isInt({ min: 1 })
  .withMessage("userId must be a positive integer");

const userIdOrUsername = oneOf(
  [
    body("userId").exists({ values: "falsy" }),
    body("username").exists({ values: "falsy" }),
  ],
  { message: "Either username or userId must be provided" },
);

const memberIds = [
  body("memberIds").customSanitizer((value) =>
    Array.isArray(value) ? value : [value],
  ),
  body("memberIds.*")
    .toInt()
    .isInt({ min: 1 })
    .withMessage("memberId must be a positive integer"),
];

const memberId = body("memberId")
  .toInt()
  .exists({ values: "falsy" })
  .withMessage("memberId is required")
  .isInt({ min: 1 })
  .withMessage("memberId must be a positive integer");

const role = body("role")
  .trim()
  .toUpperCase()
  .exists({ values: "falsy" })
  .withMessage("role is required")
  .isIn(ALLOWED_ROLES)
  .withMessage(
    `role must be one of the following: ${ALLOWED_ROLES.join(", ")}`,
  );

const content = body("content")
  .optional()
  .trim()
  .default(null)
  .isLength({ max: CONTENT_MAX_LENGTH })
  .withMessage(
    `Message content cannot exceed ${CONTENT_MAX_LENGTH} characters`,
  );

const contentOrAttachment = oneOf([
  body("content").exists({ values: "falsy" }),
  check().custom((_, { req }) => req.attachmentUrl),
]);

const cursor = query("cursor")
  .optional()
  .isInt({ min: 1 })
  .withMessage(`cursor must be a positive integer`)
  .toInt();

const limit = query("limit")
  .toInt()
  .default(5)
  .isInt({ min: MIN_LIMIT, max: MAX_LIMIT })
  .withMessage(
    `limit must be an integer between ${MIN_LIMIT} and ${MAX_LIMIT}`,
  );

const bodyValidators = {
  login: [requiredUsername, password],
  signup: [requiredUsername, password],
  patchMe: [alias, description, aliasDescriptionOrAvatar],
  postRequest: [userId, optionalUsername, userIdOrUsername],
  postGroup: [name, description, memberIds],
  patchGroup: [name, description, nameDescriptionOrAvatar],
  postMember: memberId,
  patchMember: role,
  getMessages: [cursor, limit],
  postMessage: [content, contentOrAttachment],
};

const throwValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const httpErrors = errors
    .array({ onlyFirstError: true })
    .map(({ location, path, value, msg }) => ({
      type: "VALIDATION_ERROR",
      message: msg,
      location,
      field: path,
      value,
    }));

  throw new HttpError(422, httpErrors);
};

for (const [validator, chain] of Object.entries(bodyValidators)) {
  bodyValidators[validator] = [
    ...(Array.isArray(chain) ? chain.flat() : [chain]),
    throwValidationErrors,
  ];
}

const paramId = (key) => [param(key).isInt().toInt(), throwValidationErrors];

module.exports = {
  paramId,
  ...bodyValidators,
};
