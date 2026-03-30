const prisma = require("../lib/prisma");

module.exports.getInbox = async (req, res) => {
  const { id: userId } = req.user;

  const directChatParticipations = await prisma.participation.findMany({
    where: { userId, chat: { type: "DIRECT" } },
    select: {
      chat: {
        select: {
          id: true,
          type: true,
          messages: {
            select: { id: true, text: true },
            orderBy: { id: "desc" },
            take: 1,
          },
          participations: {
            where: { userId: { not: userId } },
            select: { user: { select: { username: true, avatarUrl: true } } },
          },
        },
      },
    },
  });

  const groupChatParticipations = await prisma.participation.findMany({
    where: { userId, chat: { type: "GROUP" } },
    select: {
      chat: {
        select: {
          id: true,
          type: true,
          name: true,
          avatarUrl: true,
          messages: {
            select: { id: true, text: true },
            orderBy: { id: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  const allParticipations = [
    ...directChatParticipations,
    ...groupChatParticipations,
  ];

  allParticipations.sort((a, b) => {
    const aMessageId = a.chat.messages[0]?.id ?? -1;
    const bMessageId = b.chat.messages[0]?.id ?? -1;

    return bMessageId - aMessageId;
  });

  const inbox = allParticipations.map(({ chat }) => {
    const otherUser = chat.participations?.[0].user;
    return {
      chatId: chat.id,
      name: chat.name ?? otherUser.username,
      avatarUrl: chat.avatarUrl ?? otherUser.avatarUrl,
      lastMessage: chat.messages[0],
    };
  });

  res.json({ inbox });
};
