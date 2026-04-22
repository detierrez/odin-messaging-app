const { matchedData } = require("express-validator");
const prisma = require("../lib/prisma");
const { httpError } = require("../middlewares");
const { genericChatSelect, genericMessageSelect } = require("./apiSelects");
const { notifyRequest, notifyUsers, notifyUser } = require("../socket.io");
const { formatChat, isReadable } = require("./chats");

module.exports.postFriend = async (req, res) => {
  const { id: userId } = req.user;
  const { friendId } = matchedData(req);

  const { chat, existingChat } = await prisma.$transaction(async (tx) => {
    const request = await tx.request.findUnique({
      where: {
        senderId_receiverId: { senderId: friendId, receiverId: userId },
      },
    });
    if (!request) {
      throw new httpError(404, [{ reason: "Friend request not found" }]);
    }

    await tx.request.delete({
      where: {
        senderId_receiverId: { senderId: friendId, receiverId: userId },
      },
    });

    const existingChat = await tx.chat.findFirst({
      where: {
        type: "DIRECT",
        AND: [
          { writeAccesses: { some: { userId } } },
          { writeAccesses: { some: { userId: friendId } } },
        ],
      },
      select: { id: true, readAccesses: { select: { userId } } },
    });

    const select = genericChatSelect;

    let chat;
    if (existingChat) {
      chat = await tx.chat.update({
        where: { id: existingChat.id },
        data: {
          readAccesses: {
            connectOrCreate: [
              {
                where: {
                  userId_chatId: {
                    userId,
                    chatId: existingChat.id,
                  },
                },
                create: { userId },
              },
              {
                where: {
                  userId_chatId: {
                    userId: friendId,
                    chatId: existingChat.id,
                  },
                },
                create: { userId: friendId },
              },
            ],
          },
          writeAccesses: {
            updateMany: {
              where: { userId: { in: [userId, friendId] } },
              data: { endedAt: null },
            },
          },
        },
        select,
      });
    } else {
      chat = await tx.chat.create({
        data: {
          readAccesses: {
            create: [{ userId }, { userId: friendId }],
          },
          writeAccesses: {
            create: [{ userId }, { userId: friendId }],
          },
        },
        select,
      });
    }

    return { chat, existingChat };
  });

  notifyRequest("remove_request", friendId, userId);
  for (const id of [userId, friendId]) {
    if (isReadable(existingChat, id)) {
      notifyUser("reactivate_chat", id, { chatId: chat.id });
    } else {
      notifyUser("add_chat", id, { chat: formatChat(chat, id) });
    }
  }

  res.json({ success: true });
};

module.exports.deleteFriend = async (req, res) => {
  const { id: userId } = req.user;
  const { friendId } = matchedData(req);

  if (userId === friendId) {
    throw new httpError(400, [{ reason: "You cannot unfriend yourself" }]);
  }

  const chatId = await prisma.$transaction(async (tx) => {
    const chat = await tx.chat.findFirst({
      where: {
        type: "DIRECT",
        AND: [
          { writeAccesses: { some: { userId } } },
          { writeAccesses: { some: { userId: friendId } } },
        ],
      },
      select: { id: true },
    });

    if (!chat) {
      throw new httpError(404, [{ reason: "Chat not found" }]);
    }

    await tx.writeAccess.updateMany({
      where: {
        userId: { in: [userId, friendId] },
        chatId: chat.id,
        endedAt: null,
      },
      data: { endedAt: new Date() },
    });

    return chat.id;
  });

  notifyUsers("deactivate_chat", [userId, friendId], { chatId });
  res.json({ success: true });
};
