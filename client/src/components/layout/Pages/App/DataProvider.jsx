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
    {},
  );
  const [inbox, setInbox] = useState(null);
  const [friends, dispatchFriends] = useReducer(friendsReducer, null);
  const [requests, dispatchRequests] = useReducer(requestsReducer, null);
  const [groups, dispatchGroups] = useReducer(groupsReducer, null);
  const [activeChatId, setActiveChatId] = useState(null);

  const { user } = useUser();
  const userId = user.id;

  const activeChat = chatHistories[activeChatId];

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const abortError = new Error("Request aborted");

    const fetchInbox = fetchBackend(`/inbox?id=${userId}`, { signal });
    const fetchFriends = fetchBackend(`/friends?id=${userId}`, { signal });
    const fetchRequests = fetchBackend(`/requests?id=${userId}`, { signal });
    const fetchGroups =
      // fetchBackend(`/groups?id=${userId}`, { signal });
      Promise.resolve({ groups: null });
    Promise.all([fetchInbox, fetchFriends, fetchRequests, fetchGroups])
      .then(([{ inbox }, { friends }, { requests }, { groups }]) => {
        setInbox(inbox);
        dispatchFriends({ type: "load", friends });
        dispatchRequests({ type: "load", requests });
        dispatchGroups({ type: "load", groups });
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
      setInbox((prevInbox) => {
        if (!prevInbox) return prevInbox;

        const oldEntry = prevInbox.find((e) => e.chatId === message.chatId);
        const rest = prevInbox.filter((e) => e.chatId !== message.chatId);

        return [{ ...oldEntry, lastMessage: message }, ...rest];
      });

      dispatchChatHistories({
        type: "add_message",
        message,
      });
    }

    socket.on("friends_mutation", onFriendMutation);
    function onFriendMutation({ action, ...payload }) {
      dispatchFriends({ type: action, ...payload });
    }

    socket.on("request_mutation", onRequestMutation);
    function onRequestMutation({ action, ...payload }) {
      dispatchRequests({ type: action, ...payload });
    }

    return () => {
      socket.off("new_message", onNewMessage);
      socket.off("friends_mutation", onFriendMutation);
      socket.off("request_mutation", onRequestMutation);
      socket.disconnect();
    };
  }, [userId]);

  return (
    <DataContext value={{ inbox, friends, chat: activeChat, requests, groups }}>
      <SetChatContext value={{ setActiveChatId }}>{children}</SetChatContext>
    </DataContext>
  );
}

function chatHistoriesReducer(chatHistories, action) {
  switch (action.type) {
    case "add_chat": {
      const { chat } = action;
      return { ...chatHistories, [chat.id]: chat };
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

function friendsReducer(friends, action) {
  switch (action.type) {
    case "load": {
      return action.friends;
    }

    case "add": {
      return [...friends, action.friend];
    }

    case "remove": {
      return friends.filter((f) => f.id !== action.friendId);
    }

    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

function groupsReducer(groups, action) {
  switch (action.type) {
    case "load": {
      return action.groups;
    }

    case "add": {
      return [...groups, action.group];
    }

    case "remove": {
      return groups.filter((g) => g.id !== action.groupId);
    }

    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}
