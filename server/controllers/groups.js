const { matchedData } = require("express-validator");
const prisma = require("../lib/prisma");
const { httpError } = require("../middlewares");
const { apiChatSelect } = require("./common");

module.exports.postGroup = async (req, res) => {
  const { id: userId } = req.user;
  const { name, membersIds } = req.body;

  // TODO: sanitize membersIds so it contain no repeated ids
  const friendshipsCount = await prisma.friendship.count({
    where: {
      OR: [
        { lesserId: userId, greaterId: { in: membersIds } },
        { greaterId: userId, lesserId: { in: membersIds } },
      ],
    },
  });

  if (friendshipsCount !== membersIds.length) {
    throw new httpError(400, [{ reason: "A user is not in your friend list" }]);
  }

  const allMembersIds = [userId, ...membersIds];
  const membershipsCreate = allMembersIds.map((memberId) => ({
    userId: memberId,
    role: memberId === userId ? "ADMIN" : "MEMBER",
  }));

  const group = await prisma.group.create({
    data: {
      name,
      memberships: {
        create: membershipsCreate,
      },
      chat: { create: {} },
    },
    select: { chat: { select: apiChatSelect } },
  });

  const io = req.app.get("io");
  io.to(allMembersIds.map((id) => `${id}`)).emit("chats_mutation", {
    action: "add_chat",
    chat: group.chat,
  });

  res.json({ group });
};

module.exports.deleteGroup = async (req, res) => {
  const { id: userId } = req.user;
  const { groupId } = matchedData(req);

  const { chatId } = await prisma.$transaction(async (tx) => {
    const membership = await tx.membership.delete({
      where: { userId_groupId: { userId, groupId } },
      select: {
        role: true,
        group: { select: { chat: { select: { id: true } } } },
      },
    });

    const membershipsCount = await tx.membership.count({
      where: { groupId },
    });

    if (!membershipsCount) {
      await tx.group.delete({ where: { id: groupId } });
    } else if (membershipsCount === 1) {
      await tx.membership.updateMany({
        where: { groupId },
        data: { role: "ADMIN" },
      });
    } else {
      if (membership.role === "ADMIN") {
        const anotherAdmin = await tx.membership.findFirst({
          where: { groupId, role: "ADMIN" },
        });

        if (!anotherAdmin) {
          const newAdmin = await tx.membership.findFirst({
            where: { groupId },
            select: { userId: true },
          });

          await tx.membership.update({
            where: { userId_groupId: { userId: newAdmin.userId, groupId } },
            data: { role: "ADMIN" },
          });
        }
      }
    }

    return {
      chatId: membership.group.chat.id,
    };
  });

  const io = req.app.get("io");
  io.to(`${userId}`).emit("chats_mutation", {
    action: "remove_chat",
    chatId,
  });
};
