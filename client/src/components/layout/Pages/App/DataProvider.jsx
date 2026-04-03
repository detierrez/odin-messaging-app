import { useEffect, useReducer, useState } from "react";
import io from "socket.io-client";
import {
  SERVER_BASE_URL,
  fetchBackend,
} from "../../../../router/actions-loaders";
import { useUser } from "../../../../hooks";
import { DataContext, SetChatContext } from "../../../../contexts/contexts";

export default function DataProvider({ children }) {
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

    const fetchInbox = fetchBackend(`/chats/inbox?id=${userId}`, { signal });
    const fetchRequests = fetchBackend(`/requests?id=${userId}`, { signal });

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
  }, [userId]);

  useEffect(() => {
    if (!activeChatId) return;
    if (activeChat) return;

    const controller = new AbortController();
    const abortError = new Error("Request aborted");
    fetchBackend(`/chats/${activeChatId}?id=${userId}`, {
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
  }, [userId, activeChatId, activeChat]);

  useEffect(() => {
    const socket = io(SERVER_BASE_URL, {
      auth: { token: userId },
    });

    socket.on("new_message", onNewMessage);
    function onNewMessage(message) {
      dispatchChatHistories({
        type: "add_message",
        message,
      });
    }

    socket.on("new_chat", onNewChat);
    function onNewChat(chat) {
      dispatchChatHistories({
        type: "add_chat",
        chat: parseChat(userId, chat),
      });
    }

    socket.on("remove_chat", onRemoveChat);
    function onRemoveChat(chatId) {
      dispatchChatHistories({
        type: "remove_chat",
        chatId,
      });
    }

    socket.on("request_mutation", onRequestMutation);
    function onRequestMutation({ action, ...payload }) {
      dispatchRequests({ type: action, ...payload });
    }

    return () => {
      socket.off("new_message", onNewMessage);
      socket.off("new_chat", onNewChat);
      socket.off("request_mutation", onRequestMutation);
      socket.disconnect();
    };
  }, [userId]);

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
      const { message } = action;
      const { chatId } = message;
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

  return {
    ...chat,
    name: group ? group.name : friend.username,
    avatarUrl: group ? group.avatarUrl : friend.avatarUrl,
    friend,
  };
}
