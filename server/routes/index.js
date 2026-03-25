const { Router } = require("express");
const {
  getMessagesByFriend,
  postMessageToFriend,
  getInbox,
  getFriends,
} = require("../controllers/messages");
const {
  logger,
  maskInternalErrors,
  throw404,
  sendError,
} = require("../middlewares");
const { strictAuthenticate } = require("../middlewares");
const { validateId } = require("../middlewares");

const friends = Router();
const friendId = Router({ mergeParams: true });
friends.use("/:friendId", validateId("friendId"), friendId);
friends.route("/").get(getFriends);
friendId.route("/messages").get(getMessagesByFriend).post(postMessageToFriend);

const inbox = Router();
inbox.get("/", getInbox);

const index = Router();
index.use(logger);
index.use(strictAuthenticate);
index.use("/friends", friends);
index.use("/inbox", inbox);
index.use(throw404, maskInternalErrors, sendError);

module.exports = index;
