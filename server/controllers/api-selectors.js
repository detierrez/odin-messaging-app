const user = {
  id: true,
  username: true,
  alias: true,
  avatarUrl: true,
  description: true,
};

const message = {
  id: true,
  chatId: true,
  userId: true,
  type: true,
  sentAt: true,
  content: true,
  attachmentUrl: true,
  metadata: true,
};

const friendship = {
  friendAId: true,
  friendBId: true,
  endedAt: true,
  chat: { select: { id: true } },
};

const group = {
  select: {
    id: true,
    name: true,
    description: false,
    avatarUrl: true,
    chat: { select: { id: true } },
    participations: false,
  },
};

const fullAccessGroup = {
  select: {
    ...group.select,
    description: true,
    participations: {
      where: { endedAt: null },
      select: { userId: true, groupId: true, role: true },
    },
  },
};

const apiSelectors = {
  user,
  message,
  friendship,
};

module.exports = apiSelectors;
