import { useEffect, useReducer, useState } from "react";
import io from "socket.io-client";
import { useId } from "@hooks";
import { DataContext, SetChatContext } from "@contexts";
import { useApi } from "@hooks/index";
import { UsersContext } from "@contexts/index";

export default function DataProvider({ children }) {
  const { SERVER_BASE_URL, fetchApi } = useApi();
  const [chatHistories, dispatchChatHistories] = useReducer(
    chatHistoriesReducer,
    null,
  );
  const [requests, dispatchRequests] = useReducer(requestsReducer, null);
  const [activeChatId, setActiveChatId] = useState(null);
  const [users, setUsers] = useState(null);
  const { id } = useId();
  const activeChat = chatHistories?.[activeChatId];

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const abortError = new Error("Request aborted");

    Promise.all([
      fetchApi(`/users/me`, { signal }),
      fetchApi(`/chats/inbox`, { signal }),
      fetchApi(`/requests`, { signal }),
    ])
      .then(([{ user }, { chats }, { requests }]) => {
        setUsers({ [user.id]: user });
        dispatchChatHistories({ type: "load", chats });
        dispatchRequests({ type: "load", requests });
      })
      .catch((error) => {
        if (error !== abortError) throw error;
      });

    return () => {
      controller.abort(abortError);
    };
  }, [fetchApi]);

  useEffect(() => {
    const socket = io(SERVER_BASE_URL, {
      auth: { token: id },
    });

    const eventDispatchers = [
      { event: "add_request", dispatch: dispatchRequests },
      { event: "remove_request", dispatch: dispatchRequests },
      { event: "add_chat", dispatch: dispatchChatHistories },
      { event: "update_chat", dispatch: dispatchChatHistories },
      { event: "deactivate_chat", dispatch: dispatchChatHistories },
      { event: "reactivate_chat", dispatch: dispatchChatHistories },
      { event: "add_message", dispatch: dispatchChatHistories },
      { event: "add_membership", dispatch: dispatchChatHistories },
      { event: "update_membership", dispatch: dispatchChatHistories },
      { event: "remove_membership", dispatch: dispatchChatHistories },
    ];

    eventDispatchers.forEach(({ event, dispatch }) =>
      socket.on(event, (payload) => {
        console.log({ event, payload });
        dispatch({ ...payload, type: event });
      }),
    );

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [SERVER_BASE_URL, id]);

  return (
    <UsersContext value={{ users, setUsers }}>
      <DataContext
        value={{
          users,
          chatHistories,
          chat: activeChat,
          requests,
          dispatchChatHistories,
        }}
      >
        <SetChatContext value={{ setActiveChatId }}>{children}</SetChatContext>
      </DataContext>
    </UsersContext>
  );
}

function chatHistoriesReducer(chatHistories, action) {
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
      return { ...chatHistories, [chat.id]: formatChat(chat) };
    }
    case "update_chat": {
      const { chatId, name, avatarUrl } = action;
      const existingChat = chatHistories[chatId];
      const nextChat = {
        ...existingChat,
        name: name ?? existingChat.name,
        avatarUrl: avatarUrl ?? existingChat.avatarUrl,
      };
      return { ...chatHistories, [chatId]: nextChat };
    }
    case "deactivate_chat": {
      const { chatId } = action;
      const nextChat = { ...chatHistories[chatId], isActive: false };
      return { ...chatHistories, [chatId]: nextChat };
    }
    case "reactivate_chat": {
      const { chatId } = action;
      const nextChat = { ...chatHistories[chatId], isActive: true };
      return { ...chatHistories, [chatId]: nextChat };
    }
    case "add_message": {
      const { chatId, message } = action;
      const existingChat = chatHistories[chatId];
      return {
        ...chatHistories,
        [chatId]: {
          ...existingChat,
          messages: [...existingChat.messages, message],
        },
      };
    }
    case "add_messages": {
      const { chatId, messages } = action;
      const existingChat = chatHistories[chatId];
      if (messages.length > 0) {
        return {
          ...chatHistories,
          [chatId]: {
            ...existingChat,
            messages: [...messages, ...existingChat.messages],
          },
        };
      } else {
        const { messages: existingMessages } = existingChat;
        const oldestMessage = existingMessages[0];
        return {
          ...chatHistories,
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
      const existingChat = chatHistories[chatId];
      return {
        ...chatHistories,
        [chatId]: {
          ...existingChat,
          memberships: { ...existingChat.memberships, [userId]: role },
        },
      };
    }
    case "remove_membership": {
      const { chatId, memberId } = action;
      const existingChat = chatHistories[chatId];
      const { [memberId]: _discardedRole, ...nextMemberships } =
        existingChat.memberships;
      return {
        ...chatHistories,
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

function requestsReducer(requests, action) {
  switch (action.type) {
    case "load": {
      const { sentTo, receivedFrom } = action.requests;
      return { sentTo: new Set(sentTo), receivedFrom: new Set(receivedFrom) };
    }
    case "add_request": {
      const { senderId, receiverId } = action;
      const setName = senderId ? "receivedFrom" : "sentTo";
      const nextSet = new Set(requests[setName]);
      nextSet.add(senderId || receiverId);
      return { ...requests, [setName]: nextSet };
    }
    case "remove_request": {
      const { senderId, receiverId } = action;
      const setName = senderId ? "receivedFrom" : "sentTo";
      const nextSet = new Set(requests[setName]);
      nextSet.delete(senderId || receiverId);
      return { ...requests, [setName]: nextSet };
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
    const membershipEntries = memberships.map(({ userId, role }) => [
      userId,
      role,
    ]);
    memberships = Object.fromEntries(membershipEntries);
  }

  return { ...chat, memberships };
}
