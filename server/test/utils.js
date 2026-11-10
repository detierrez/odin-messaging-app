const prisma = require("../lib/prisma");
const { toSorted } = require("../lib/utils");

module.exports.cleanupRelationships = async (userIds) => {
  await prisma.request.deleteMany({
    where: {
      OR: [{ senderId: { in: userIds } }, { receiverId: { in: userIds } }],
    },
  });
  await prisma.friendship.deleteMany({
    where: {
      OR: [{ friendAId: { in: userIds } }, { friendBId: { in: userIds } }],
    },
  });
};

module.exports.getFriendshipKey = (userId1, userId2) => {
  const [friendAId, friendBId] = toSorted([userId1, userId2]);
  return { friendAId, friendBId };
};
