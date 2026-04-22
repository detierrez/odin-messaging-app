const { Router } = require("express");
const m = require("../middlewares");
const c = require("../controllers");

const { validators: v } = m;

// USERS
const users = Router();
users.get("/me", c.users.getMe);
users.patch("/me", v.patchMe, c.users.patchMe);
users.get("/:userId", v.paramId("userId"), c.users.getUser);

// FRIENDS
const friends = Router();
friends.use("/:friendId", v.paramId("friendId"));
friends.post("/:friendId", c.friends.postFriend);
friends.delete("/:friendId", c.friends.deleteFriend);

// REQUESTS
const requests = Router();
requests.get("/", c.requests.getRequests);
requests.post("/", v.postRequest, c.requests.postRequest);
requests.delete(
  "/:otherUserId",
  v.paramId("otherUserId"),
  c.requests.deleteRequest,
);

// CHATS
const chats = Router();
chats.get("/inbox", c.chats.getInbox);
chats.post("/", v.postChat, c.chats.postChat);

chats.use(
  "/:chatId",
  v.paramId("chatId"),
  v.access("MEMBER"),
  v.chatType("GROUP"),
);

chats.get("/:chatId/messages", v.getMessages, c.messages.getMessages);
chats.post("/:chatId/messages", v.postMessage, c.messages.postMessage);
chats.delete("/:chatId/members/me", c.members.deleteMemberMe);

chats.use("/:chatId", v.access("ADMIN"));
chats.patch("/:chatId", v.patchChat, c.chats.patchChat);
chats.post("/:chatId/members", v.postMember, c.members.postMember);

chats.use("/:chatId/members/:memberId", v.paramId("memberId"));
chats.patch("/:chatId/members/:memberId", v.patchMember, c.members.patchMember);
chats.delete("/:chatId/members/:memberId", c.members.deleteMember);

// MAIN ROUTER
const index = Router();
index.use(m.logger);
index.use(m.strictAuthenticate);
index.use("/users", users);
index.use("/friends", friends);
index.use("/requests", requests);
index.use("/chats", chats);
index.use(m.throw404, m.maskInternalErrors, m.sendError);

module.exports = index;
