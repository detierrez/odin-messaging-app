const { matchedData } = require("express-validator");
const prisma = require("../lib/prisma");
const socketIo = require("../lib/socket-io");
const { HttpError } = require("../lib/errors");
const apiSelectors = require("./api-selectors");

module.exports.postMember = async (req, res) => {
  const { id: userId } = req.user;
  const { groupId, memberId } = matchedData(req);

  if (userId === memberId) {
    throw new HttpError(422, "You cannot add yourself.");
  }

  const { participation, message } = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: memberId },
      select: {
        participations: { where: { groupId, endedAt: null } },
        friendshipsA: { where: { friendAId: userId, endedAt: null } },
        friendshipsB: { where: { friendBId: userId, endedAt: null } },
      },
    });

    if (!user) {
      throw new HttpError(404, "User not found.");
    }

    if (user.participations.length > 0) {
      throw new HttpError(409, "This user is already a member.");
    }

    if (!(user.friendshipsA.length > 0 || user.friendshipsB.length > 0)) {
      throw new HttpError(422, "You are not friends with this user.");
    }

    const { group, ...participation } = await tx.participation.upsert({
      where: { userId_groupId: { userId: memberId, groupId } },
      update: { endedAt: null, role: "MEMBER" },
      create: { userId: memberId, groupId },
      select: {
        userId: true,
        groupId: true,
        role: true,
        group: {
          select: {
            chat: { select: { id: true } },
          },
        },
      },
    });

    const message = await tx.message.create({
      data: {
        chatId: group.chat.id,
        type: "JOIN",
        userId,
        metadata: { targetUserId: memberId },
      },
      select: apiSelectors.message,
    });

    return { participation, message };
  });

  socketIo.notifyGroup(groupId, "add_participation", {
    participation,
  });
  socketIo.addToGroupRoom(memberId, groupId);
  socketIo.notifyGroup(groupId, "add_message", { message });

  res.json({ success: true });
};

module.exports.deleteMembers = async (req, res) => {
  const { id: userId } = req.user;
  const { groupId } = matchedData(req);

  const { group, message } = await prisma.$transaction(async (tx) => {
    await tx.participation.updateMany({
      where: { groupId, endedAt: null },
      data: { endedAt: new Date() },
    });

    const message = await tx.message.create({
      data: { groupId, type: "CLOSE", userId },
      select: { ...apiSelectors.message },
    });

    return { message };
  });

  socketIo.notifyGroup(groupId, "add_message", { message });
  socketIo.notifyGroup(groupId, "update_group", {
    group: { id: groupId, description: null, participations: null },
  });
  socketIo.closeGroupRoom(groupId);

  res.json({ success: true });
};

module.exports.patchMember = async (req, res) => {
  const { id: userId } = req.user;
  const { groupId, memberId, role } = matchedData(req);

  if (userId === memberId) {
    throw new HttpError(422, "You cannot update your own role");
  }

  const { participation, message } = await prisma.$transaction(async (tx) => {
    let query;
    try {
      query = await tx.participation.update({
        where: { userId_groupId: { userId: memberId, groupId }, endedAt: null },
        data: { role },
        select: {
          userId: true,
          groupId: true,
          role: true,
          group: { select: { chat: { select: { id: true } } } },
        },
      });
    } catch (error) {
      throw error.code === "P2025"
        ? new HttpError(404, "Member not found.")
        : error;
    }

    const { group, ...participation } = query;

    const message = await tx.message.create({
      data: {
        userId,
        chatId: group.chat.id,
        type: "ROLE_UPDATE",
        metadata: { targetUserId: memberId, role },
      },
      select: apiSelectors.message,
    });

    return { participation, message };
  });

  socketIo.notifyGroup(groupId, "add_message", { message });
  socketIo.notifyGroup(groupId, "update_participation", { participation });

  res.json({ success: true });
};

module.exports.deleteMember = async (req, res) => {
  const { id: userId } = req.user;
  const { groupId, memberId } = matchedData(req);

  if (userId === memberId) {
    throw new HttpError(422, "You cannot remove yourself.");
  }

  const { participation, message } = await prisma.$transaction(async (tx) => {
    let query;

    try {
      query = await tx.participation.update({
        where: { userId_groupId: { userId: memberId, groupId }, endedAt: null },
        data: { endedAt: new Date() },
        select: {
          userId: true,
          groupId: true,
          group: { select: { chat: { select: { id: true } } } },
        },
      });
    } catch (error) {
      throw error.code === "P2025"
        ? new HttpError(404, "Member not found.")
        : error;
    }

    const { group, ...participation } = query;

    const message = await tx.message.create({
      data: {
        chatId: group.chat.id,
        type: "LEAVE",
        userId,
        metadata: { targetUserId: memberId },
      },
      select: apiSelectors.message,
    });

    return { participation, message };
  });

  socketIo.notifyGroup(groupId, "add_message", { message });
  socketIo.removeFromGroupRoom(memberId, groupId);
  socketIo.notifyGroup(groupId, "remove_participation", { participation });
  socketIo.notifyUser(memberId, "update_group", {
    group: { id: groupId, description: null, participations: null },
  });

  res.json({ success: true });
};

module.exports.deleteMemberMe = async (req, res) => {
  const { id: userId } = req.user;
  const { groupId } = matchedData(req);

  const { participation, message, promotedParticipation, promotionMessage } =
    await prisma.$transaction(async (tx) => {
      const {
        group: {
          chat: { id: chatId },
        },
        ...participation
      } = await tx.participation.update({
        where: { userId_groupId: { userId, groupId }, endedAt: null },
        data: { endedAt: new Date() },
        select: {
          userId: true,
          groupId: true,
          role: true,
          group: { select: { chat: { select: { id: true } } } },
        },
      });

      const message = await tx.message.create({
        data: {
          chatId,
          userId,
          type: "LEAVE",
        },
        select: apiSelectors.message,
      });

      if (participation.role !== "ADMIN") {
        return { participation, message };
      }

      const succeedingParticipation = await tx.participation.findFirst({
        where: { groupId, endedAt: null },
        select: { userId: true },
      });

      if (!succeedingParticipation) {
        return { participation, message };
      }

      const promotedId = succeedingParticipation.userId;
      const role = "ADMIN";
      const promotedParticipation = await tx.participation.update({
        where: {
          userId_groupId: { userId: promotedId, groupId },
        },
        data: { role },
        select: { userId: true, groupId: true, role: true },
      });

      const promotionMessage = await tx.message.create({
        data: {
          chatId,
          type: "ROLE_UPDATE",
          userId: promotedId,
          metadata: { role },
        },
        select: apiSelectors.message,
      });

      return {
        participation,
        message,
        promotedParticipation,
        promotionMessage,
      };
    });

  socketIo.notifyGroup(groupId, "add_message", { message });
  socketIo.removeFromGroupRoom(userId, groupId);
  socketIo.notifyGroup(groupId, "remove_participation", { participation });
  socketIo.notifyUser(userId, "update_group", {
    group: { id: groupId, description: null, participations: null },
  });

  if (promotedParticipation) {
    socketIo.notifyGroup(groupId, "add_message", { message: promotionMessage });
    socketIo.notifyGroup(groupId, "update_participation", {
      participation: promotedParticipation,
    });
  }

  res.json({ success: true });
};
