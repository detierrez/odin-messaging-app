import { useContext, useEffect, useState } from "react";
import { fetchBackend } from "../router/actions-loaders";
import {
  ActiveContactContext,
  UserContext,
  WebSocketContext,
} from "../contexts/contexts";

import io from "socket.io-client";
import { SERVER_BASE_URL } from "../router/actions-loaders";

export function useData() {
  const [chatHistories, setChatHistories] = useState({});
  const [inbox, setInbox] = useState(null);
  const { activeContactId } = useActiveContact();

  const { user } = useUser();
  const userId = user.id;

  const activeChat = chatHistories[activeContactId];

  useEffect(() => {
    const controller = new AbortController();
    const abortError = new Error("Request aborted");
    fetchBackend(`/inbox?id=${userId}`, {
      signal: controller.signal,
    })
      .then((data) => {
        setInbox(
          data.map((msg) => {
            const { fromId, toId } = msg;
            const contactId = userId !== fromId ? fromId : toId;
            return { ...msg, contactId };
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
    if (!activeContactId) return;
    if (activeChat) return;

    const controller = new AbortController();
    const abortError = new Error("Request aborted");
    fetchBackend(`/contacts/${activeContactId}/messages?id=${userId}`, {
      signal: controller.signal,
    })
      .then((data) => {
        setChatHistories((prev) => ({
          ...prev,
          [activeContactId]: data,
        }));
      })
      .catch((error) => {
        if (error !== abortError) throw error;
      });
    return () => {
      controller.abort(abortError);
    };
  }, [userId, activeContactId, activeChat]);

  useEffect(() => {
    const socket = io(SERVER_BASE_URL, {
      auth: { token: userId },
    });
    socket.on("new_message", onNewMessage);
    function onNewMessage(newMessage) {
      const { fromId, toId } = newMessage;
      const peerId = fromId === userId ? toId : fromId;
      setInbox((prevInbox) => {
        return [
          newMessage,
          ...prevInbox.filter((i) => {
            const inboxPeerId = userId !== i.fromId ? i.fromId : i.toId;
            return inboxPeerId !== peerId;
          }),
        ];
      });

      setChatHistories((prevHistory) => {
        const existingChat = prevHistory[peerId];
        if (!existingChat) return prevHistory;
        return {
          ...prevHistory,
          [peerId]: [...existingChat, newMessage],
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

export function useActiveContact() {
  return useContext(ActiveContactContext);
}

export function useWebSocket() {
  return useContext(WebSocketContext);
}
