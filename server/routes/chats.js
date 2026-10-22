const { Router } = require("express");
const m = require("../middlewares");
const c = require("../controllers");

const { validators: v } = m;

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

module.exports = chats;

