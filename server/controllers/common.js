const apiChatSelect = {
  id: true,
  messages: true,
  group: {
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      memberships: {
        select: {
          role: true,
          user: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  },
  friendship: {
    select: { lesserIdUser: true, greaterIdUser: true },
  },
};

const apiInboxChatSelect = {
  ...apiChatSelect,
  messages: { orderBy: { id: "desc" }, take: 1 },
};

module.exports = {
  apiChatSelect,
  apiInboxChatSelect,
};
