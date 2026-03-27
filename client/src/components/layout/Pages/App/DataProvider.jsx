import { useEffect, useReducer, useState } from "react";
import io from "socket.io-client";
import {
  SERVER_BASE_URL,
  fetchBackend,
} from "../../../../router/actions-loaders";
import { useActiveFriend, useUser } from "../../../../hooks";
import { getFriendId } from "../../../../utils";
import { DataContext } from "../../../../contexts/contexts";

export default function DataProvider({ children }) {
  const [chatHistories, dispatchChatHistories] = useReducer(
    chatHistoriesReducer,
    {},
  );
  const [inbox, setInbox] = useState(null);
  const [requests, dispatchRequests] = useReducer(requestsReducer, {
    sent: [],
    received: [],
  });
  const {
    activeFriend: { id: activeFriendId },
  } = useActiveFriend();

  const { user } = useUser();
  const userId = user.id;

  const activeChat = chatHistories[activeFriendId];

  useEffect(() => {
    const controller = new AbortController();
    const abortError = new Error("Request aborted");
    fetchBackend(`/inbox?id=${userId}`, {
      signal: controller.signal,
    })
      .then(({ inbox }) => {
        setInbox(
          inbox.map((msg) => {
            const { fromId, toId } = msg;
            const friendId = userId !== fromId ? fromId : toId;
            return { ...msg, friendId };
          }),
        );
      })
      .catch((error) => {
        if (error !== abortError) throw error;
      });
    return () => {
      controller.abort(abortError);
    };
  }, [userId]);

  useEffect(() => {
    const controller = new AbortController();
    const abortError = new Error("Request aborted");
    fetchBackend(`/requests?id=${userId}`, {
      signal: controller.signal,
    })
      .then(({ requests }) => {
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
    if (!activeFriendId) return;
    if (activeChat) return;

    const controller = new AbortController();
    const abortError = new Error("Request aborted");
    fetchBackend(`/friends/${activeFriendId}/messages?id=${userId}`, {
      signal: controller.signal,
    })
      .then(({ messages }) => {
        dispatchChatHistories({
          type: "add_chat",
          friendId: activeFriendId,
          chat: messages,
        });
      })
      .catch((error) => {
        if (error !== abortError) throw error;
      });
    return () => {
      controller.abort(abortError);
    };
  }, [userId, activeFriendId, activeChat]);

  useEffect(() => {
    const socket = io(SERVER_BASE_URL, {
      auth: { token: userId },
    });

    socket.on("new_message", (message) => {
      const friendId = getFriendId(userId, message);

      setInbox((prevInbox) => {
        return [
          message,
          ...prevInbox.filter((msg) => getFriendId(userId, msg) !== friendId),
        ];
      });

      dispatchChatHistories({
        type: "add_message",
        friendId,
        message,
      });
    });

    socket.on("request_mutation", onRequestMutation);
    function onRequestMutation({ action, direction, request }) {
      dispatchRequests({ type: action, direction, request });
    }

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  return (
    <DataContext value={{ inbox, chat: activeChat, requests }}>
      {children}
    </DataContext>
  );
}

function chatHistoriesReducer(chatHistories, action) {
  switch (action.type) {
    case "add_chat": {
      const { friendId, chat } = action;
      return { ...chatHistories, [friendId]: chat };
    }
    case "add_message": {
      const { friendId, message } = action;
      const existingChat = chatHistories[friendId];
      if (!existingChat) return chatHistories;
      return {
        ...chatHistories,
        [friendId]: [...existingChat, message],
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
      const { direction, request } = action;
      const existingRequests = requests[direction];
      return { ...requests, [direction]: [...existingRequests, request] };
    }

    case "cancel": {
      const { direction, request } = action;
      const existingRequests = requests[direction];
      console.log("asd", {
        ...requests,
        [direction]: existingRequests.filter((r) => r.id !== request.id),
      });
      return {
        ...requests,
        [direction]: existingRequests.filter((r) => r.id !== request.id),
      };
    }

    case "accept": {
      const { direction, request } = action;
      const existingRequests = requests[direction];
      return {
        ...requests,
        [direction]: existingRequests.filter((r) => r.id !== request.id),
      };
    }

    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}
