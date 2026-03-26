const { Router } = require("express");
const {
  getMessagesByFriend,
  postMessageToFriend,
  getInbox,
  getFriends,
  getRequests,
  acceptRequest,
  postRequest,
  rejectRequest,
  deleteRequest,
  deleteFriend,
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
friends.route("/").get(getFriends);
friends.use("/:friendId", validateId("friendId"), friendId);
friendId.get("/messages", getMessagesByFriend);
friendId.post("/messages", postMessageToFriend);
friendId.delete("/", deleteFriend);

const requests = Router();
const requestId = Router({ mergeParams: true });
requests.get("/", getRequests);
requests.post("/", postRequest);
requests.use("/:requestId", validateId("requestId"), requestId);
requestId.post("/accept", acceptRequest);
requestId.post("/reject", rejectRequest);
requestId.delete("/", deleteRequest);

const inbox = Router();
inbox.get("/", getInbox);

const index = Router();
index.use(logger);
index.use(strictAuthenticate);
index.use("/friends", friends);
index.use("/requests", requests);
index.use("/inbox", inbox);
index.use(throw404, maskInternalErrors, sendError);

module.exports = index;
