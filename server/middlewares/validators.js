const {
  param,
  query,
  body,
  validationResult,
  oneOf,
  matchedData,
} = require("express-validator");
const prisma = require("../lib/prisma");
const { httpError } = require("./errorHandlers");

const GROUPNAME_MAX_LENGTH = 2 ** 6;
const DESCRIPTION_MAX_LENGTH = 2 ** 7;
const CONTENT_MAX_LENGTH = 2 ** 11;
const MIN_LIMIT = 1;
const MAX_LIMIT = 100;

const throwValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const cause = errors.array({ onlyFirstError: true }).map((err) => {
    const { location, path, value, msg } = err;
    return { location, field: path, value, reason: msg };
  });

  throw new httpError(400, cause);
};

const validate = (validations) => [
  ...(Array.isArray(validations) ? validations.flat() : [validations]),
  throwValidationErrors,
];

const required = (fields) => {
  return body(fields)
    .trim()
    .exists({ values: "falsy" })
    .withMessage("Field is required");
};

const login = validate(required(["username", "password"]));
const signup = validate([
  required(["username", "password"]),
  body("username").custom(async (username) => {
    const user = await prisma.user.findUnique({ where: { username } });
    if (user) throw new Error("already exists");
  }),
  body("password")
    .isLength({ min: 8 })
    .withMessage("must be at least 8 characters long"),
]);

const paramId = (key) => validate(param(key).isInt().toInt());

const memberId = required("memberId").isInt().toInt();

const role = required("role").toUpperCase().isIn(["ADMIN", "MEMBER"]);

const description = body("description")
  .optional()
  .isString()
  .trim()
  .customSanitizer((description) => (description === "" ? null : description))
  .isLength({ max: DESCRIPTION_MAX_LENGTH })
  .withMessage(
    `Description cannot exceed ${DESCRIPTION_MAX_LENGTH} characters`,
  );

const username = required("username")
  .isString()
  .toLowerCase()
  .isAlphanumeric()
  .withMessage("username must only contain letters and numbers");

const content = required("content")
  .isString()
  .isLength({ max: CONTENT_MAX_LENGTH })
  .withMessage(
    `Message content cannot exceed ${CONTENT_MAX_LENGTH} characters`,
  );

const cursor = query("cursor")
  .optional()
  .isInt({ min: 1 })
  .withMessage(`cursor must be a positive integer`)
  .toInt();

const limit = query("limit")
  .default(5)
  .isInt({ min: MIN_LIMIT, max: MAX_LIMIT })
  .withMessage(`limit must be an integer between ${MIN_LIMIT} and ${MAX_LIMIT}`)
  .toInt();

const isActive = body("isActive")
  .optional()
  .isBoolean({ strict: true })
  .withMessage("isActive must be a boolean");

const memberIds = [
  body("memberIds")
    .isArray({ min: 1 })
    .withMessage("A list of members is required"),
  body("memberIds.*").isInt().toInt(),
];

const groupName = body("name")
  .trim()
  .optional({ values: "falsy" })
  .isLength({ max: GROUPNAME_MAX_LENGTH })
  .withMessage(`Group name cannot exceed ${GROUPNAME_MAX_LENGTH} characters`);

const patchMe = validate(description);
const postRequest = validate(username);
const getMessages = validate([cursor, limit]);
const postMessage = validate(content);
const postChat = validate([memberIds, groupName]);
const patchChat = validate([isActive, groupName]);
const postMember = validate(memberId);
const patchMember = validate(role);

const access = (role) => async (req, res, next) => {
  const { id: userId } = req.user;
  const { chatId } = matchedData(req);

  const writeAccess = await getWriteAccess(res, userId, chatId);
  const hasAccess =
    writeAccess && (role === "ADMIN" ? writeAccess.role === "ADMIN" : true);
  if (!hasAccess) {
    throw new httpError(403, [
      {
        reason: `You do not have ${role.toLowerCase()} participation in this chat`,
      },
    ]);
  }

  next();
};

const chatType = (type) => async (req, res, next) => {
  const { id: userId } = req.user;
  const { chatId } = matchedData(req);

  const writeAccess = await getWriteAccess(res, userId, chatId);
  if (!writeAccess) {
    throw new httpError(403, [
      {
        reason: `You do not have access to this chat`,
      },
    ]);
  }
  if (writeAccess.chat.type !== type) {
    throw new httpError(403, [
      {
        reason: `You must provide a valid ${type.toLowerCase()} chat`,
      },
    ]);
  }

  next();
};

async function getWriteAccess(res, userId, chatId) {
  let { access } = res.locals;
  if (access === undefined) {
    access =
      (await prisma.writeAccess.findFirst({
        where: { userId, chatId, endedAt: null },
        select: { role: true, chat: { select: { type: true } } },
      })) || null;
    res.locals.access = access;
  }

  return access;
}

module.exports = {
  login,
  signup,
  paramId,
  access,
  chatType,
  patchMe,
  postRequest,
  getMessages,
  postMessage,
  postChat,
  patchChat,
  postMember,
  patchMember,
};
