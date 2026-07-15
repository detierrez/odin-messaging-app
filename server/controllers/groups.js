const { matchedData } = require("express-validator");
const prisma = require("../lib/prisma");
const socketIo = require("../lib/socket-io");
const { httpError } = require("../middlewares");
const apiSelectors = require("./api-selectors");

module.exports.checkRole = (role) => async (req, res, next) => {
  const { id: userId } = req.user;
  const { groupId } = matchedData(req);

  const participation = await prisma.participation.findUnique({
    where: { userId_groupId: { userId, groupId }, role, endedAt: null },
  });

  if (!participation) {
    throw new HttpError(
      403,
      `You do not have ${role.toLowerCase()} participation in this chat.`,
    );
  }

  next();
};

async (req, res) => {};

module.exports.postGroup = async (req, res) => {
  const { id: userId } = req.user;
  const { name, description, memberIds } = matchedData(req);
  const { avatarUrl } = req;

  const allMembers = [...new Set([...memberIds, userId])];
  const otherMembers = allMembers.filter((id) => id !== userId);

  if (otherMembers.length === 0) {
    throw new httpError(400, "You must add at least one other member");
  }

  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [
        { AND: [{ friendAId: userId }, { friendBId: { in: otherMembers } }] },
        { AND: [{ friendBId: userId }, { friendAId: { in: otherMembers } }] },
      ],
      endedAt: null,
    },
    select: { friendAId: true, friendBId: true },
  });

  const friendIds = new Set(
    friendships.map(({ friendAId, friendBId }) =>
      userId === friendAId ? friendBId : friendAId,
    ),
  );

  const unfoundMembers = otherMembers.filter((id) => !friendIds.has(id));

  if (unfoundMembers.length > 0) {
    throw new httpError(
      409,
      `These members are not in your friend list: ${unfoundMembers.join(", ")}`,
    );
  }

  const {
    id: groupId,
    chat: {
      messages: { 0: message },
    },
  } = await prisma.group.create({
    data: {
      name,
      description,
      avatarUrl,
      participations: {
        create: allMembers.map((memberId) => ({
          userId: memberId,
          role: memberId === userId ? "ADMIN" : "MEMBER",
        })),
      },
      chat: {
        create: {
          messages: {
            create: {
              type: "OPEN",
              userId,
              metadata: { isOldestMessage: true },
            },
          },
        },
      },
    },
    select: {
      id: true,
      chat: {
        select: {
          messages: { select: apiSelectors, take: 1, orderBy: { id: "desc" } },
        },
      },
    },
  });

  socketIo.addToGroupRoom(allMembers, groupId);
  socketIo.notifyGroup(groupId, "add_message", message);

  res.json({ success: true });
};

module.exports.patchGroup = async (req, res) => {
  const { id: userId } = req.user;
  const { groupId, name, description } = matchedData(req);
  const { avatarUrl } = req;

  const { group, message } = await prisma.$transaction(async (tx) => {
    const { chat, ...group } = await tx.group.update({
      where: { id: groupId },
      data: { name, description, avatarUrl },
      select: {
        id: true,
        name,
        description,
        avatarUrl,
        chat: { select: { id: true } },
      },
    });

    const message = await tx.message.create({
      data: {
        chatId: chat.id,
        type: "PROFILE_UPDATE",
        userId,
        metadata: { updatedFields: { name, description, avatarUrl } },
      },
      select: genericMessageSelect,
    });

    return { group, message };
  });

  socketIo.notifyGroup(groupId, "update_group", { group });
  socketIo.notifyGroup(groupId, "add_message", { message });

  res.json({ success: true });
};
