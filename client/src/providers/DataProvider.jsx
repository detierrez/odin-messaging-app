import { useEffect, useReducer, useState } from "react";
import io from "socket.io-client";
import { useUser } from "@hooks";
import { DataContext, SetChatContext } from "@contexts";
import { useApi } from "@hooks/index";

export default function DataProvider({ children }) {
  const { SERVER_BASE_URL, apiFetch } = useApi();
  const [chatHistories, dispatchChatHistories] = useReducer(
    chatHistoriesReducer,
    null,
  );
  const [requests, dispatchRequests] = useReducer(requestsReducer, null);
  const [activeChatId, setActiveChatId] = useState(null);

  const { user } = useUser();
  const userId = user.id;

  const activeChat = chatHistories?.[activeChatId];

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const abortError = new Error("Request aborted");

    const fetchInbox = apiFetch(`/chats/inbox`, { signal });
    const fetchRequests = apiFetch(`/requests`, { signal });

    Promise.all([fetchInbox, fetchRequests])
      .then(([{ chats }, { requests }]) => {
        chats = chats.map((chat) => parseChat(userId, chat));
        dispatchChatHistories({ type: "load", chats });
        dispatchRequests({ type: "load", requests });
      })
      .catch((error) => {
        if (error !== abortError) throw error;
      });

    return () => {
      controller.abort(abortError);
    };
  }, [apiFetch, userId]);

  useEffect(() => {
    if (!activeChatId) return;
    if (activeChat) return;

    const controller = new AbortController();
    const abortError = new Error("Request aborted");
    apiFetch(`/chats/${activeChatId}`, {
      signal: controller.signal,
    })
      .then(({ chat }) => {
        dispatchChatHistories({
          type: "add_chat",
          chat,
        });
      })
      .catch((error) => {
        if (error !== abortError) throw error;
      });
    return () => {
      controller.abort(abortError);
    };
  }, [apiFetch, activeChatId, activeChat]);

  useEffect(() => {
    const socket = io(SERVER_BASE_URL, {
      auth: { token: userId },
    });

    socket.on("chats_mutation", onChatsMutation);
    function onChatsMutation({ action, ...payload }) {
      const { chat } = payload;
      if (chat) payload.chat = parseChat(userId, chat);
      dispatchChatHistories({ type: action, ...payload });
    }

    socket.on("request_mutation", onRequestMutation);
    function onRequestMutation({ action, ...payload }) {
      dispatchRequests({ type: action, ...payload });
    }

    return () => {
      socket.off("chats_mutation", onChatsMutation);
      socket.off("request_mutation", onRequestMutation);
      socket.disconnect();
    };
  }, [SERVER_BASE_URL, userId]);

  return (
    <DataContext value={{ chatHistories, chat: activeChat, requests }}>
      <SetChatContext value={{ setActiveChatId }}>{children}</SetChatContext>
    </DataContext>
  );
}

function chatHistoriesReducer(chatHistories, action) {
  switch (action.type) {
    case "load": {
      const chatHistories = {};
      for (const chat of action.chats) {
        chatHistories[chat.id] = chat;
      }

      return chatHistories;
    }
    case "add_chat": {
      const { chat } = action;
      return { ...chatHistories, [chat.id]: chat };
    }
    case "remove_chat": {
      const { chatId } = action;
      const { [chatId]: _discarded, ...rest } = chatHistories;
      return rest;
    }
    case "add_message": {
      const { chatId, message } = action;
      const existingChat = chatHistories[chatId];
      if (!existingChat) return chatHistories;
      return {
        ...chatHistories,
        [chatId]: {
          ...existingChat,
          messages: [...existingChat.messages, message],
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
      return action.requests;
    }
    case "add": {
      const { listName, otherUser } = action;
      const prevList = requests[listName];
      return { ...requests, [listName]: [...prevList, otherUser] };
    }
    case "remove": {
      const { listName, otherUser } = action;
      const prevList = requests[listName];
      return {
        ...requests,
        [listName]: prevList.filter((user) => user.id !== otherUser.id),
      };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

function parseChat(userId, chat) {
  const { group, friendship } = chat;

  let friend;
  if (friendship) {
    const { lesserIdUser, greaterIdUser } = friendship;
    friend = userId === lesserIdUser.id ? greaterIdUser : lesserIdUser;
  }
  const name = group ? group.name : friend.username;
  const avatarUrl = group ? group.avatarUrl : friend.avatarUrl;

  return {
    ...chat,
    name,
    avatarUrl,
    friend,
  };
}
