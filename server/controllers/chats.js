const { matchedData } = require("express-validator");
const prisma = require("../lib/prisma");
const { httpError } = require("../middlewares");

module.exports.getChat = async (req, res) => {
  const { id: userId } = req.user;
  const { chatId } = matchedData(req);

  const chat = await prisma.chat.findUnique({
    where: { id: chatId, participations: { some: { userId } } },
    include: {
      messages: {
        select: { id: true, fromId: true, text: true },
        orderBy: { id: "asc" },
      },
      participations: {
        where: { userId: { not: userId } },
        select: {
          user: {
            select: { id: true, username: true, avatarUrl: true },
          },
        },
      },
    },
  });

  if (!chat) {
    throw new httpError(404, [{ reason: "No chat found" }]);
  }

  const { id, type, name, avatarUrl, messages, participations } = chat;
  const otherUser = participations[0].user;

  const response = {
    id,
    type,
    name: name ?? otherUser?.username,
    avatarUrl: avatarUrl ?? otherUser?.avatarUrl,
    users: participations.map(({ user }) => user),
    messages,
  };

  res.json({ chat: response });
};

module.exports.postChat = async (req, res) => {
  const { id: userId } = req.user;
  const { chatId } = matchedData(req);
  const { text } = req.body;

  const participation = await prisma.participation.findUnique({
    where: { userId_chatId: { userId, chatId } },
  });

  if (!participation) {
    throw new httpError(404, [
      { reason: "You do not participate in this chat" },
    ]);
  }

  const { toId, ...message } = await prisma.message.create({
    data: { text, fromId: userId, toId: chatId },
  });

  res.json({ chatId, message });
};
