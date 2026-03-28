const { Router } = require("express");
const {
  logger,
  maskInternalErrors,
  throw404,
  sendError,
} = require("../middlewares");
const { strictAuthenticate } = require("../middlewares");
const { validateId } = require("../middlewares");
const { getFriends, deleteFriend } = require("../controllers/friends");
const {
  getMessagesByFriend,
  postMessageToFriend,
} = require("../controllers/messages");
const {
  getRequests,
  postRequest,
  acceptRequest,
  rejectRequest,
  deleteRequest,
} = require("../controllers/requests");
const { getInbox } = require("../controllers/inbox");
const { getGroups, postGroup } = require("../controllers/groups");

const friends = Router();
const friendId = Router({ mergeParams: true });
const messages = Router({ mergeParams: true });

const inbox = Router();
inbox.get("/", getInbox);

friends.get("/", getFriends);

friends.use("/:friendId", validateId("friendId"), friendId);
friendId.delete("/", deleteFriend);

friendId.use("/messages", messages);
messages.get("/", getMessagesByFriend);
messages.post("/", postMessageToFriend);

const requests = Router();
const requestId = Router({ mergeParams: true });

requests.get("/", getRequests);
requests.post("/", postRequest);

requests.use("/:requestId", validateId("requestId"), requestId);
requestId.post("/accept", acceptRequest);
requestId.post("/reject", rejectRequest);
requestId.delete("/", deleteRequest);

const groups = Router();
groups.get("/", getGroups);
groups.post("/", postGroup);

const index = Router();
index.use(logger);
index.use(strictAuthenticate);
index.use("/inbox", inbox);
index.use("/friends", friends);
index.use("/requests", requests);
index.use("/groups", groups);
index.use(throw404, maskInternalErrors, sendError);

module.exports = index;
