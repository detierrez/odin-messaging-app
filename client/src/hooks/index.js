import { useContext, useEffect } from "react";
import { SetChatContext, DataContext, IdContext } from "@contexts";
import { ApiContext, UsersContext } from "@contexts/index";

export function useId() {
  return useContext(IdContext);
}

export function useSetChat() {
  return useContext(SetChatContext);
}

export function useData() {
  return useContext(DataContext);
}

export function useApi() {
  return useContext(ApiContext);
}

export function useUsers() {
  return useContext(UsersContext);
}

export function useUser(userId) {
  const { fetchApi } = useApi();
  const { users, setUsers } = useUsers();
  const user = users?.[userId];
  const shouldFetch = userId && !user;

  useEffect(() => {
    if (!shouldFetch) return;

    const controller = new AbortController();
    const { signal } = controller;
    const abortError = new Error("Request aborted");
    fetchApi(`/users/${userId}`, { signal })
      .then(({ user }) => {
        setUsers((prev) => {
          return { ...prev, [user.id]: user };
        });
      })
      .catch((error) => {
        if (error !== abortError) throw error;
      });

    return () => controller.abort(abortError);
  }, [userId, shouldFetch, fetchApi, setUsers]);

  return user;
}

export function useInbox() {
  const { chatHistories } = useData();
  if (chatHistories) {
    const inbox = Object.values(chatHistories)
      .filter((chat) => chat.messages.length > 0)
      .map(({ id, otherUserId, name, avatarUrl, messages }) => {
        return {
          chatId: id,
          otherUserId,
          name,
          avatarUrl,
          lastMessage: messages.at(-1),
        };
      })
      .sort((a, b) => b.lastMessage.id - a.lastMessage.id);
    return inbox;
  }
  return null;
}

export function useFriends() {
  const { chatHistories } = useData();

  const friends = !chatHistories
    ? null
    : Object.values(chatHistories)
        .filter((chat) => chat.type === "DIRECT" && chat.isActive)
        .map(({ id, otherUserId }) => {
          return {
            chatId: id,
            friendId: otherUserId,
          };
        });

  return friends;
}

export function useGroups() {
  const { chatHistories } = useData();

  const groups = !chatHistories
    ? null
    : Object.values(chatHistories)
        .filter((chat) => chat.type === "GROUP" && chat.isActive)
        .map(({ id, name, avatarUrl }) => {
          return {
            chatId: id,
            name,
            avatarUrl,
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name));

  return groups;
}
