const prisma = require("../lib/prisma");
const apiSelectors = require("./api-selectors");

module.exports.getChats = async (req, res) => {
  const { id: userId } = req.user;

  const chats = await prisma.chat.findMany({
    where: {
      OR: [
        { group: { participations: { some: { userId } } } },
        { OR: [{ friendAId: userId }, { friendBId: userId }] },
      ],
    },
    select: {
      id: true,
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

  res.json({ chats });
};
