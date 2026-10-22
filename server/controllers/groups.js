const { matchedData } = require("express-validator");
const prisma = require("../lib/prisma");
const socketIo = require("../lib/socket-io");
const apiSelectors = require("./api-selectors");
const { HttpError } = require("../lib/errors");

module.exports.checkRole = (role) => async (req, res, next) => {
  const { id: userId } = req.user;
  const { groupId } = matchedData(req);

  const { role: currentRole } =
    (await getParticipation(prisma, userId, groupId)) ?? {};

  const requiredRoles = role === "MEMBER" ? ["MEMBER", "ADMIN"] : ["ADMIN"];

  if (!currentRole || !requiredRoles.includes(currentRole)) {
    throw new HttpError(
      403,
      `You do not have ${role.toLowerCase()} participation in this chat.`,
    );
  }

  next();
};

module.exports.getGroup = async (req, res) => {
  const { id: userId } = req.user;
  const { groupId } = matchedData(req);

  const group = await prisma.$transaction(async (tx) => {
    const participation = await getParticipation(tx, userId, groupId);
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: !!participation
        ? apiSelectors.fullAccessGroup
        : apiSelectors.group,
    });

    return group;
  });

  res.json({ group });
};

module.exports.postGroup = async (req, res) => {
  const { id: userId } = req.user;
  const { name, description, memberIds } = matchedData(req);
  const { avatarUrl } = req;

  const allMembers = [...new Set([...memberIds, userId])];
  const otherMembers = allMembers.filter((id) => id !== userId);

  if (otherMembers.length === 0) {
    throw new HttpError(400, "You must add at least one other member");
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
    throw new HttpError(
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
          messages: {
            select: apiSelectors.message,
            take: 1,
            orderBy: { id: "desc" },
          },
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
        name: !!name,
        description: !!description,
        avatarUrl: !!avatarUrl,
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
      select: apiSelectors.message,
    });

    return { group, message };
  });

  socketIo.notifyGroup(groupId, "update_group", { group });
  socketIo.notifyGroup(groupId, "add_message", { message });

  res.json({ success: true });
};

async function getParticipation(client, userId, groupId) {
  const participation = await client.participation.findUnique({
    where: {
      userId_groupId: { userId, groupId },
      endedAt: null,
    },
    select: { role: true },
  });

  return participation;
}
