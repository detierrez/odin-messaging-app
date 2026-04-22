const { matchedData } = require("express-validator");
const prisma = require("../lib/prisma");
const { httpError } = require("../middlewares");
const { addToChatRoom, notifyUser, notifyChat } = require("../socket.io");
const {
  baseChatSelect,
  genericMessageSelect,
  genericChatSelect,
  firstMessageChatSelect,
} = require("./apiSelects");

module.exports.getInbox = async (req, res) => {
  const { id: userId } = req.user;

  const chats = await prisma.chat.findMany({
    where: {
      readAccesses: { some: { userId } },
    },
    select: firstMessageChatSelect,
  });

  chats.sort((a, b) => {
    const aDate = a.messages[0]?.sentAt || 0;
    const bDate = b.messages[0]?.sentAt || 0;
    return bDate - aDate;
  });

  const formattedChats = chats.map((chat) => formatChat(chat, userId));

  res.json({ chats: formattedChats });
};

module.exports.postChat = async (req, res) => {
  const { id: userId } = req.user;
  const { memberIds, name } = matchedData(req);

  const allMembers = [...new Set([...memberIds, userId])];
  const otherMembers = allMembers.filter((id) => id !== userId);

  if (otherMembers.length === 0) {
    throw new httpError(400, [
      { reason: "You must add at least one other member" },
    ]);
  }

  const activeDirects = await prisma.chat.findMany({
    where: {
      type: "DIRECT",
      AND: [
        { writeAccesses: { some: { userId, endedAt: null } } },
        {
          writeAccesses: {
            some: { userId: { in: otherMembers }, endedAt: null },
          },
        },
      ],
    },
    select: {
      writeAccesses: { select: { userId: true } },
    },
  });

  const friendIds = new Set(
    activeDirects.flatMap((chat) => chat.writeAccesses.map((wa) => wa.userId)),
  );
  const unfoundMembers = otherMembers.filter((id) => !friendIds.has(id));

  if (unfoundMembers.length > 0) {
    throw new httpError(400, [
      {
        reason: `These members are not in your friend list: ${unfoundMembers.join(", ")}`,
      },
    ]);
  }

  const chat = await prisma.chat.create({
    data: {
      type: "GROUP",
      name,
      readAccesses: {
        create: allMembers.map((memberId) => ({
          userId: memberId,
        })),
      },
      writeAccesses: {
        create: allMembers.map((memberId) => ({
          userId: memberId,
          role: memberId === userId ? "ADMIN" : "MEMBER",
        })),
      },
    },
    select: genericChatSelect,
  });

  for (const memberId of allMembers) {
    addToChatRoom(memberId, chat.id);
    notifyUser("add_chat", memberId, { chat: formatChat(chat, memberId) });
  }

  res.json({ success: true });
};

module.exports.patchChat = async (req, res) => {
  const { id: userId } = req.user;
  const { chatId, isActive, name } = matchedData(req);

  const adminAccess = await prisma.writeAccess.findFirst({
    where: { userId, chatId, role: "ADMIN", endedAt: null },
  });

  if (!adminAccess) {
    throw new httpError(403, [
      { reason: "You do not administrate or participate in this chat" },
    ]);
  }

  await prisma.$transaction(async (tx) => {
    if (isActive === false) {
      await tx.writeAccess.updateMany({
        where: { chatId, endedAt: null },
        data: { endedAt: new Date() },
      });
    }

    if (name !== undefined) {
      await tx.chat.update({
        where: { id: chatId },
        data: { name },
      });
    }
  });

  if (name !== undefined) notifyChat("update_chat", chatId, { chatId, name });
  if (isActive === false) notifyChat("deactivate_chat", chatId, { chatId });

  res.json({ success: true });
};

function formatChat(chat, userId) {
  const { id, name, avatarUrl, type, messages, writeAccesses } = chat;

  const isActive = !!writeAccesses.find((access) => access.userId === userId);
  const otherUserId =
    type === "DIRECT"
      ? writeAccesses.find((access) => access.userId !== userId)?.userId
      : null;
  const memberships = type === "DIRECT" ? null : writeAccesses;

  return {
    id,
    type,
    otherUserId,
    name,
    avatarUrl,
    isActive,
    memberships,
    messages,
  };
}

function isReadable(chat, userId) {
  return !!chat?.readAccesses.find((access) => access.userId === userId);
}

module.exports.formatChat = formatChat;
module.exports.isReadable = isReadable;
