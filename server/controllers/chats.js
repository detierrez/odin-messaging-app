const { matchedData } = require("express-validator");
const prisma = require("../lib/prisma");
const { httpError } = require("../middlewares");
const { toSorted } = require("../lib/common");

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
    select: {
      chat: {
        select: {
          type: true,
          participations: { where: { userId: { not: userId } } },
        },
      },
    },
  });

  if (!participation) {
    throw new httpError(404, [
      { reason: "You do not participate in this chat" },
    ]);
  }

  const {
    chat: { type, participations: otherParticipations },
  } = participation;
  if (type === "DIRECT") {
    const otherUserId = otherParticipations[0].userId;
    const [lesserId, greaterId] = toSorted([userId, otherUserId]);
    const friendship = await prisma.friendship.findUnique({
      where: { lesserId_greaterId: { lesserId, greaterId } },
    });
    if (!friendship) {
      throw new httpError(400, [
        { reason: "You are not friends with this user" },
      ]);
    }
  }

  const message = await prisma.message.create({
    data: { userId, chatId, text },
  });

  const io = req.app.get("io");
  const otherUsersIds = otherParticipations.map(({ userId }) => `${userId}`);
  io.to([`${userId}`, ...otherUsersIds]).emit("new_message", message);

  res.json({ message });
};
