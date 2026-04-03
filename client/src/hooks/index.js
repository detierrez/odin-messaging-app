import { useContext } from "react";

import { SetChatContext, DataContext, UserContext } from "../contexts/contexts";

export function useUser() {
  return useContext(UserContext);
}

export function useSetChat() {
  return useContext(SetChatContext);
}

export function useData() {
  return useContext(DataContext);
}

export function useInbox() {
  const { chatHistories } = useData();
  if (chatHistories) {
    const inbox = Object.values(chatHistories)
      .filter((chat) => chat.messages.length > 0)
      .map(({ id, name, avatarUrl, messages }) => {
        return {
          chatId: id,
          name,
          avatarUrl,
          lastMessage: messages[messages.length - 1],
        };
      })
      .sort((a, b) => b.lastMessage.id - a.lastMessage.id);
    return inbox;
  }
}

export function useFriends() {
  const { chatHistories } = useData();
  if (chatHistories) {
    const friends = Object.values(chatHistories)
      .filter((chat) => chat.friend)
      .map(({ id, friend }) => {
        return {
          chatId: id,
          ...friend,
        };
      })
      .sort((a, b) => a.username.localeCompare(b.username));
    return friends;
  }
}

export function useGroups() {
  const { chatHistories } = useData();
  if (chatHistories) {
    const groups = Object.values(chatHistories)
      .filter((chat) => chat.group)
      .map(({ id, group }) => {
        return {
          chatId: id,
          ...group,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
    return groups;
  }
}
