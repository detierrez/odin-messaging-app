const { matchedData } = require("express-validator");
const prisma = require("../lib/prisma");
const socketIo = require("../lib/socket-io");
const { HttpError } = require("../lib/errors");
const apiSelectors = require("./api-selectors");

module.exports.getMessages = async (req, res) => {
  const { id: userId } = req.user;
  const { chatId, cursor, limit } = matchedData(req);

  const chat = await prisma.chat.findUnique({
    where: {
      id: chatId,
      OR: [
        { group: { participations: { some: { userId } } } },
        { OR: [{ friendAId: userId }, { friendBId: userId }] },
      ],
    },
    select: {
      friendship: { select: { endedAt: true } },
      group: {
        select: {
          participations: { where: { userId }, select: { endedAt: true } },
        },
      },
    },
  });

  if (!chat) {
    throw new HttpError(404, "Chat not found");
  }

  const { group, friendship } = chat;
  const { endedAt } = group ? group.participations[0] : friendship;

  const messages = await prisma.message.findMany({
    where: { chatId, id: { lt: cursor } },
    select: apiSelectors.message,
    take: limit,
    orderBy: { id: "desc" },
  });

  res.json({ messages });
};

module.exports.postMessage = async (req, res) => {
  const { id: userId } = req.user;
  const { chatId, content } = matchedData(req);
  const { attachmentUrl } = req;

  let chat;
  try {
    chat = await prisma.chat.update({
      where: {
        id: chatId,
        OR: [
          { group: { participations: { some: { userId, endedAt: null } } } },
          {
            friendship: {
              OR: [{ friendAId: userId }, { friendBId: userId }],
              endedAt: null,
            },
          },
        ],
      },
      data: { messages: { create: { userId, content, attachmentUrl } } },
      select: {
        groupId: true,
        friendAId: true,
        friendBId: true,
        messages: {
          select: apiSelectors.message,
          orderBy: { id: "desc" },
          take: 1,
        },
      },
    });
  } catch (error) {
    throw error.code === "P2025" ? new HttpError(404, "Chat not found") : error;
  }

  const {
    groupId,
    friendAId,
    friendBId,
    messages: { 0: message },
  } = chat;

  if (groupId) {
    socketIo.notifyGroup(groupId, "add_message", { message });
  } else {
    socketIo.notifyUser([friendAId, friendBId], "add_message", { message });
  }

  res.json({ message });
};
