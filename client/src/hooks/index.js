import { useContext, useEffect, useState } from "react";
import { fetchBackend } from "../router/actions-loaders";
import {
  ActiveFriendContext,
  UserContext,
  WebSocketContext,
} from "../contexts/contexts";

import io from "socket.io-client";
import { SERVER_BASE_URL } from "../router/actions-loaders";
import { getFriendId } from "../utils";

export function useData() {
  const [chatHistories, setChatHistories] = useState({});
  const [inbox, setInbox] = useState(null);
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
    if (!activeFriendId) return;
    if (activeChat) return;

    const controller = new AbortController();
    const abortError = new Error("Request aborted");
    fetchBackend(`/friends/${activeFriendId}/messages?id=${userId}`, {
      signal: controller.signal,
    })
      .then(({ messages }) => {
        setChatHistories((prev) => ({
          ...prev,
          [activeFriendId]: messages,
        }));
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
    socket.on("new_message", onNewMessage);
    function onNewMessage(newMessage) {
      const friendId = getFriendId(userId, newMessage);
      setInbox((prevInbox) => {
        return [
          newMessage,
          ...prevInbox.filter((msg) => getFriendId(userId, msg) !== friendId),
        ];
      });

      setChatHistories((prevHistory) => {
        const existingChat = prevHistory[friendId];
        if (!existingChat) return prevHistory;
        return {
          ...prevHistory,
          [friendId]: [...existingChat, newMessage],
        };
      });
    }
    return () => {
      socket.off("new_message", onNewMessage);
      socket.disconnect();
    };
  }, [userId]);

  return { inbox, chat: activeChat };
}

export function useUser() {
  return useContext(UserContext);
}

export function useActiveFriend() {
  return useContext(ActiveFriendContext);
}

export function useWebSocket() {
  return useContext(WebSocketContext);
}
