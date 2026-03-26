import { useEffect, useState } from "react";
import io from "socket.io-client";
import {
  SERVER_BASE_URL,
  fetchBackend,
} from "../../../../router/actions-loaders";
import { useActiveFriend, useUser } from "../../../../hooks";
import { getFriendId } from "../../../../utils";
import { DataContext } from "../../../../contexts/contexts";

export default function DataProvider({ children }) {
  const [chatHistories, setChatHistories] = useState({});
  const [inbox, setInbox] = useState(null);
  const [incomingRequests, setIncomingRequests] = useState(null);
  const [outgoingRequests, setOutgoingRequests] = useState(null);
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
    fetchBackend(`/requests?direction=incoming&id=${userId}`, {
      signal: controller.signal,
    })
      .then(({ requests }) => {
        setIncomingRequests(requests);
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
    fetchBackend(`/requests?direction=outgoing&id=${userId}`, {
      signal: controller.signal,
    })
      .then(({ requests }) => {
        setOutgoingRequests(requests);
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

    socket.on("incoming_request", onIncomingRequest);
    function onIncomingRequest(newRequest) {
      setIncomingRequests((prev) => [...prev, newRequest]);
    }

    socket.on("outgoing_request", onOutgoingRequest);
    function onOutgoingRequest(newRequest) {
      setOutgoingRequests((prev) => [...prev, newRequest]);
    }

    return () => {
      socket.off("new_message", onNewMessage);
      socket.disconnect();
    };
  }, [userId]);

  return (
    <DataContext
      value={{ inbox, chat: activeChat, incomingRequests, outgoingRequests }}
    >
      {children}
    </DataContext>
  );
}
