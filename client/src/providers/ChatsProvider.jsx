import { useReducer } from "react";
import { ChatsContext } from "@contexts";

export default function ChatsProvider({ children }) {
  const [chats, dispatchChats] = useReducer(chatsReducer, {});

  return (
    <ChatsContext value={{ chats, dispatchChats }}>{children}</ChatsContext>
  );
}

function chatsReducer(chats, action) {
  switch (action.type) {
    case "load": {
      const chatEntries = action.chats.map((chat) => [
        chat.id,
        formatChat(chat),
      ]);
      return Object.fromEntries(chatEntries);
    }
    case "add_chat": {
      const { chat } = action;
      return { ...chats, [chat.id]: formatChat(chat) };
    }
    case "update_chat": {
      const { chatId, name, description, avatarUrl } = action;
      const existingChat = chats[chatId];
      const nextChat = { ...existingChat };

      if (name !== undefined) nextChat.name = name;
      if (description !== undefined) nextChat.description = description;
      if (avatarUrl !== undefined) nextChat.avatarUrl = avatarUrl;

      return { ...chats, [chatId]: nextChat };
    }
    case "deactivate_chat": {
      const { chatId } = action;
      const nextChat = { ...chats[chatId], isActive: false };
      return { ...chats, [chatId]: nextChat };
    }
    case "reactivate_chat": {
      const { chatId } = action;
      const nextChat = { ...chats[chatId], isActive: true };
      return { ...chats, [chatId]: nextChat };
    }
    case "add_message": {
      const { chatId, message } = action;
      const existingChat = chats[chatId];
      return {
        ...chats,
        [chatId]: {
          ...existingChat,
          messages: [...existingChat.messages, message],
        },
      };
    }
    case "add_messages": {
      const { chatId, messages } = action;
      const existingChat = chats[chatId];
      if (messages.length > 0) {
        return {
          ...chats,
          [chatId]: {
            ...existingChat,
            messages: [...messages, ...existingChat.messages],
          },
        };
      } else {
        const { messages: existingMessages } = existingChat;
        const oldestMessage = existingMessages[0];
        return {
          ...chats,
          [chatId]: {
            ...existingChat,
            messages: existingMessages.with(0, {
              ...oldestMessage,
              isBegin: true,
            }),
          },
        };
      }
    }
    case "add_membership":
    case "update_membership": {
      const {
        chatId,
        membership: { userId, role },
      } = action;
      const existingChat = chats[chatId];
      return {
        ...chats,
        [chatId]: {
          ...existingChat,
          memberships: { ...existingChat.memberships, [userId]: role },
        },
      };
    }
    case "remove_membership": {
      const { chatId, memberId } = action;
      const existingChat = chats[chatId];
      const { [memberId]: _discardedRole, ...nextMemberships } =
        existingChat.memberships;
      return {
        ...chats,
        [chatId]: {
          ...existingChat,
          memberships: nextMemberships,
        },
      };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

function formatChat(chat) {
  // const messages = chat.messages.map((message) => ({
  //   ...message,
  //   sentAt: new Date(message.sentAt),
  // }));

  let { memberships } = chat;
  if (memberships) {
    const membershipEntries = memberships.map(({ userId: memberId, role }) => [
      memberId,
      role,
    ]);
    memberships = Object.fromEntries(membershipEntries);
  }

  return { ...chat, memberships };
}
