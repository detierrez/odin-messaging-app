const { Router } = require("express");
const m = require("../middlewares");
const c = require("../controllers");

const { validators: v } = m;

const chats = Router();

chats.get("/", c.chats.getChats);

chats.get(
  "/:chatId/messages",
  v.paramId("chatId"),
  v.getMessages,
  c.messages.getMessages,
);

chats.post(
  "/:chatId/messages",
  v.paramId("chatId"),
  m.uploadFile("attachment"),
  v.postMessage,
  c.messages.postMessage,
);

module.exports = chats;
