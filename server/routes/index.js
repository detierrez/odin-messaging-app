const { Router } = require("express");
const m = require("../middlewares");
const c = require("../controllers");

const { validators: v, errors: e } = m;

// AUTHENTICATION
const auth = Router();
auth.post("/login", v.login, m.passport.authenticate, c.auth.postLogin);
auth.post("/logout", c.auth.postLogout);
auth.get("/protected", m.passport.protect, c.auth.protected);

// USERS
const users = Router();
users.get("/me", c.users.getMe);
users.patch("/me", m.uploadFile("avatar"), v.patchMe, c.users.patchMe);
users.get("/:userId", v.paramId("userId"), c.users.getUser);

// REQUESTS
const requests = Router();
requests.get("/", c.requests.getRequests);
requests.post("/", v.postRequest, c.requests.postRequest);
requests.delete(
  "/:otherUserId",
  v.paramId("otherUserId"),
  c.requests.deleteRequest,
);

// FRIENDS
const friends = Router();
friends.get("/", c.friends.getFriends);
friends.use("/:friendId", v.paramId("friendId"));
friends.post("/:friendId", c.friends.postFriend);
friends.delete("/:friendId", c.friends.deleteFriend);

// GROUPS
const groups = Router();
groups.post("/", m.uploadFile("avatar"), v.postGroup, c.groups.postGroup);

groups.use("/:groupId", v.paramId("groupId"));
groups.use("/:groupId", c.groups.checkRole("MEMBER"));
groups.delete("/:groupId/members/me", c.members.deleteMemberMe);
groups.use("/:groupId", c.groups.checkRole("ADMIN"));
groups.patch(
  "/:groupId",
  m.uploadFile("avatar"),
  v.patchGroup,
  c.groups.patchGroup,
);
groups.post("/:groupId/members", v.postMember, c.members.postMember);
groups.use("/:groupId/members/:memberId", v.paramId("memberId"));
groups.patch(
  "/:groupId/members/:memberId",
  v.patchMember,
  c.members.patchMember,
);
groups.delete("/:groupId/members/:memberId", c.members.deleteMember);

const chats = Router();
chats.get("/", c.chats.getChats);
chats.use("/:chatId", v.paramId("chatId"));
chats.get("/:chatId/messages", v.getMessages, c.messages.getMessages);
chats.post(
  "/:chatId/messages",
  m.uploadFile("attachment"),
  v.postMessage,
  c.messages.postMessage,
);

// MAIN ROUTER
const index = Router();
index.use(m.debug.logger);
index.use(m.session);
index.use(m.passport.session);
index.use("/", auth);
index.use("/users", m.passport.protect, users);
index.use("/requests", m.passport.protect, requests);
index.use("/friends", m.passport.protect, friends);
index.use("/groups", m.passport.protect, groups);
index.use("/chats", m.passport.protect, chats);
index.use(e.throwNotFoundError, e.maskInternalErrors, e.respondWithError);
module.exports = index;
