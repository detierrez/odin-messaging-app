const { matchedData } = require("express-validator");
const prisma = require("../lib/prisma");
const { httpError } = require("../middlewares");
const {
  firstMessageChatSelect,
  genericChatSelect,
  genericMessageSelect,
} = require("./apiSelects");
const {
  notifyUser,
  notifyUsers,
  addToChatRoom,
  notifyChat,
  removeFromChatRoom,
} = require("../socket.io");
const { formatChat } = require("./chats");

module.exports.postMember = async (req, res) => {
  const { id: userId } = req.user;
  const { chatId, memberId } = matchedData(req);

  if (userId === memberId) {
    throw new httpError(400, [{ reason: "You cannot add yourself" }]);
  }

  const { chat, membership, message } = await prisma.$transaction(
    async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: memberId },
        select: {
          writeAccesses: {
            where: {
              userId: memberId,
              endedAt: null,
              OR: [
                { chatId },
                {
                  chat: {
                    type: "DIRECT",
                    AND: { writeAccesses: { some: { userId, endedAt: null } } },
                  },
                },
              ],
            },
            select: { chat: { select: { id: true, type: true } } },
          },
        },
      });

      if (!user) {
        throw new httpError(404, [{ reason: "User not found" }]);
      }

      if (user.writeAccesses.some((wa) => wa.chat.id === chatId)) {
        throw new httpError(400, [{ reason: "This user is already a member" }]);
      }

      if (!user.writeAccesses.some((wa) => wa.chat.type === "DIRECT")) {
        throw new httpError(400, [
          { reason: "You are not friends with this user" },
        ]);
      }

      const message = await tx.message.create({
        data: {
          chatId,
          type: "JOIN",
          userId,
          metadata: { targetUserId: memberId },
        },
        select: genericMessageSelect,
      });

      const create = { userId: memberId, role: "MEMBER" };
      const chat = await tx.chat.update({
        where: { id: chatId },
        data: {
          writeAccesses: { create },
          readAccesses: {
            connectOrCreate: {
              where: { userId_chatId: { userId: memberId, chatId } },
              create: { userId: memberId },
            },
          },
        },
        select: firstMessageChatSelect,
      });

      return { chat, membership: create, message };
    },
  );

  notifyChat("add_membership", chatId, { chatId, membership });
  notifyChat("add_message", chatId, { chatId, message });
  notifyUser("add_chat", memberId, { chat: formatChat(chat, memberId) });
  addToChatRoom(memberId, chatId);

  res.json({ success: true });
};

module.exports.patchMember = async (req, res) => {
  const { id: userId } = req.user;
  const { chatId, memberId, role } = matchedData(req);

  if (userId === memberId) {
    throw new httpError(400, [
      { reason: "You cannot update your own membership" },
    ]);
  }

  const message = await prisma.$transaction(async (tx) => {
    const { count } = await tx.writeAccess.updateMany({
      where: { userId: memberId, chatId, endedAt: null },
      data: { role },
    });

    if (count === 0) {
      throw new httpError(404, [
        { reason: "A membership for this user and chat was not found" },
      ]);
    }

    const message = await tx.message.create({
      data: {
        chatId,
        type: "ROLE_UPDATE",
        userId,
        metadata: { targetUserId: memberId, role },
      },
      select: genericMessageSelect,
    });

    return message;
  });

  notifyChat("add_message", chatId, { chatId, message });
  notifyChat("update_membership", chatId, {
    chatId,
    membership: { userId: memberId, role },
  });

  res.json({ success: true });
};

module.exports.deleteMember = async (req, res) => {
  const { id: userId } = req.user;
  const { chatId, memberId } = matchedData(req);

  if (userId === memberId) {
    throw new httpError(400, [{ reason: "You cannot remove yourself" }]);
  }

  const message = await prisma.$transaction(async (tx) => {
    const { count } = await tx.writeAccess.updateMany({
      where: { userId: memberId, chatId, endedAt: null },
      data: { endedAt: new Date() },
    });

    if (count === 0) {
      throw new httpError(404, [
        { reason: "A membership for this user and chat was not found" },
      ]);
    }

    const message = await tx.message.create({
      data: {
        chatId,
        type: "LEAVE",
        userId,
        metadata: { targetUserId: memberId },
      },
      select: genericMessageSelect,
    });

    return message;
  });

  notifyChat("add_message", chatId, { chatId, message });
  notifyChat("remove_membership", chatId, { chatId, memberId });
  removeFromChatRoom(memberId, chatId);
  notifyUser("deactivate_chat", memberId, { chatId });

  res.json({ success: true });
};

module.exports.deleteMemberMe = async (req, res) => {
  const { id: userId } = req.user;
  const { chatId } = matchedData(req);

  const { promotedMembership, leaveMessage, roleMessage } =
    await prisma.$transaction(async (tx) => {
      const { count } = await tx.writeAccess.updateMany({
        where: { userId, chatId, endedAt: null },
        data: { endedAt: new Date() },
      });

      if (count === 0) {
        throw new httpError(404, [
          { reason: "A membership for this user and chat was not found" },
        ]);
      }

      const adminAccess = await tx.writeAccess.findFirst({
        where: { chatId, role: "ADMIN", endedAt: null },
        select: { id: true },
      });

      const leaveMessage = await tx.message.create({
        data: { chatId, type: "LEAVE", userId },
        select: genericMessageSelect,
      });

      let promotedMembership;
      let roleMessage;
      if (!adminAccess) {
        const memberAccess = await tx.writeAccess.findFirst({
          where: { chatId, endedAt: null },
          orderBy: { startedAt: "asc" },
          select: { id: true, userId: true },
        });

        if (memberAccess) {
          const role = "ADMIN";
          promotedMembership = await tx.writeAccess.update({
            where: { id: memberAccess.id },
            data: { role },
            select: { userId: true, role: true },
          });

          roleMessage = await tx.message.create({
            data: {
              chatId,
              type: "ROLE_UPDATE",
              userId: memberAccess.userId,
              metadata: { role },
            },
            select: genericMessageSelect,
          });
        }
      }

      return { promotedMembership, leaveMessage, roleMessage };
    });

  notifyChat("add_message", chatId, { chatId, message: leaveMessage });
  notifyChat("remove_membership", chatId, { chatId, userId });
  removeFromChatRoom(userId, chatId);
  notifyUser("deactivate_chat", userId, { chatId });
  if (promotedMembership) {
    notifyChat("add_message", chatId, { chatId, message: roleMessage });
    notifyChat("update_membership", chatId, {
      chatId,
      membership: promotedMembership,
    });
  }

  res.json({ success: true });
};
