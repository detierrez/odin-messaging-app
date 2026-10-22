import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { api } from "../lib/api";

export const queries = {
  ownId() {
    return queryOptions({
      queryKey: ["ownId"],
      queryFn: ({ signal }) => api.getOwnUserId(signal),
      staleTime: Infinity,
    });
  },

  user(userId) {
    return queryOptions({
      queryKey: ["users", userId],
      queryFn: ({ signal }) =>
        api
          .getUser(userId, signal)
          .then((user) => ({ ...user, name: user.alias ?? user.username })),
      enabled: !!userId,
    });
  },

  group(groupId) {
    return queryOptions({
      queryKey: ["groups", groupId],
      queryFn: ({ signal }) => api.getGroup(groupId, signal),
      enabled: !!groupId,
    });
  },

  requests() {
    return queryOptions({
      queryKey: ["requests"],
      queryFn: async ({ client }) => {
        const { requests } = await api.getRequests();
        const ownId = client.getQueryData(["ownId"]);
        const groupedRequests = requests.reduce(
          (r, { senderId, receiverId }) => {
            if (senderId === ownId) {
              r.sentTo.add(receiverId);
            } else {
              r.receivedFrom.add(senderId);
            }
            return r;
          },
          { sentTo: new Set(), receivedFrom: new Set() },
        );
        return groupedRequests;
      },
    });
  },

  friends() {
    return queryOptions({
      queryKey: ["friends"],
      queryFn: async () => new Set(await api.getFriends()),
    });
  },

  chats(isEnabled) {
    return queryOptions({
      queryKey: ["chats"],
      queryFn: async () => {
        const fetchedChats = await api.getInbox();
        const keyedChats = fetchedChats.reduce(
          (chats, chat) => ((chats[chat.id] = chat), chats),
          {},
        );

        return keyedChats;
      },
      enabled: isEnabled,
    });
  },

  messages(chatId) {
    return infiniteQueryOptions({
      queryKey: ["chats", chatId, "messages"],
      queryFn: ({ pageParam, signal }) => {
        const { cursor, limit } = pageParam ?? {};
        return api.loadMessages(chatId, cursor, limit, signal);
      },
      initialPageParam: { cursor: null, limit: 10 },
      getNextPageParam: (lastPage, _, lastParams) => {
        const { id, metadata } = lastPage?.at(-1);
        return metadata && metadata.isOldestMessage
          ? null
          : { ...lastParams, cursor: id };
      },
      select: (data) => (data ? data.pages.flat().reverse() : data),
    });
  },
};
