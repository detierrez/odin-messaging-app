const genericUserSelect = {
  id: true,
  username: true,
  alias: true,
  avatarUrl: true,
  description: true,
};

const genericMessageSelect = {
  id: true,
  type: true,
  sentAt: true,
  userId: true,
  content: true,
  attachmentUrl: true,
  metadata: true,
};

const baseChatSelect = {
  id: true,
  name: true,
  avatarUrl: true,
  description: true,
  type: true,
  writeAccesses: {
    select: { userId: true, role: true },
    where: { endedAt: null },
  },
  readAccesses: { select: { userId: true } },
};

const genericChatSelect = {
  ...baseChatSelect,
  messages: { select: genericMessageSelect },
};

const firstMessageChatSelect = {
  ...baseChatSelect,
  messages: {
    select: genericMessageSelect,
    take: 1,
    orderBy: { id: "desc" },
  },
};

module.exports = {
  genericUserSelect,
  baseChatSelect,
  genericChatSelect,
  genericMessageSelect,
  firstMessageChatSelect,
};
