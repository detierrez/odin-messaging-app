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
  getRequests,
  postRequest,
  acceptRequest,
  deleteRequest,
} = require("../controllers/requests");
const { getInbox } = require("../controllers/inbox");
const { getChat, postChat } = require("../controllers/chats");

// INBOX
const inbox = Router();

inbox.get("/", getInbox);

// FRIENDS
const friends = Router();
const friendId = Router({ mergeParams: true });

friends.get("/", getFriends);

friends.use("/:friendId", validateId("friendId"), friendId);
friendId.delete("/", deleteFriend);

// REQUESTS
const requests = Router();
const otherUserId = Router({ mergeParams: true });

requests.get("/", getRequests);
requests.post("/", postRequest);

requests.use("/:otherUserId", validateId("otherUserId"), otherUserId);
otherUserId.post("/accept", acceptRequest);
otherUserId.delete("/", deleteRequest);

// CHATS
const chats = Router();
const chatId = Router({ mergeParams: true });
// const participants = Router({ mergeParams: true });

chats.use("/:chatId", validateId("chatId"), chatId);
chatId.get("/", getChat);
chatId.post("/", postChat);

// chats.use("/participants", participants);
// participants.post("/", postParticipant);
// participants.patch("/", patchParticipant);
// participants.delete("/", deleteParticipant);

const index = Router();
index.use(logger);
index.use(strictAuthenticate);
index.use("/inbox", inbox);
index.use("/friends", friends);
index.use("/requests", requests);
index.use("/chats", chats);
index.use(throw404, maskInternalErrors, sendError);

module.exports = index;
