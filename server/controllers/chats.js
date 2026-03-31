const { matchedData } = require("express-validator");
const prisma = require("../lib/prisma");
const { httpError } = require("../middlewares");

module.exports.getChat = async (req, res) => {
  const { id: userId } = req.user;
  const { chatId } = matchedData(req);

  const participation = await prisma.participation.findUnique({
    where: { userId_chatId: { userId, chatId } },
    include: {
      chat: {
        include: {
          messages: {
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
      },
    },
  });

  if (!participation) {
    throw new httpError(404, [{ reason: "No chat found" }]);
  }

  const { chat } = participation;
  const {
    id,
    type,
    name,
    avatarUrl,
    messages,
    participations: otherParticipations,
  } = chat;
  const users = otherParticipations.map(({ user }) => user);
  const otherUser = users[0];

  const response = {
    id,
    type,
    name: name ?? otherUser?.username,
    avatarUrl: avatarUrl ?? otherUser?.avatarUrl,
    users,
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

  const message = await prisma.message.create({
    data: { userId, chatId, text },
  });

  const allParticipations = await prisma.participation.findMany({
    where: { chatId },
    select: { userId: true },
  });

  const io = req.app.get("io");
  const recipientIds = allParticipations.map(({ userId }) => `${userId}`);
  io.to(recipientIds).emit("new_message", message);

  res.json({ message });
};
