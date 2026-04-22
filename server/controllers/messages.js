const { matchedData } = require("express-validator");
const prisma = require("../lib/prisma");
const { genericMessageSelect } = require("./apiSelects");
const { notifyChat } = require("../socket.io");
const { httpError } = require("../middlewares");

module.exports.getMessages = async (req, res) => {
  const { id: userId } = req.user;
  const { chatId, cursor, limit } = matchedData(req);

  const chat = await prisma.chat.findUnique({
    where: { id: chatId, readAccesses: { some: { userId } } },
    select: {
      messages: {
        select: genericMessageSelect,
        take: limit,
        orderBy: { id: "desc" },
        where: { id: { lt: cursor } },
      },
    },
  });

  if (!chat) {
    throw new httpError(404, [{ reason: "Chat not found" }]);
  }

  res.json({ messages: chat.messages });
};

module.exports.postMessage = async (req, res) => {
  const { id: userId } = req.user;
  const { chatId, content } = matchedData(req);

  const message = await prisma.message.create({
    data: { userId, chatId, content },
    select: genericMessageSelect,
  });

  notifyChat("add_message", chatId, { chatId, message });
  res.json({ success: true });
};
