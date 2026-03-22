import { useEffect, useState } from "react";
import io from "socket.io-client";
import { SERVER_BASE_URL } from "../router/actions-loaders";
import { WebSocketContext } from "../contexts/contexts";
import { useUser } from "../hooks";

export default function WebSocketProvider({ children }) {
  const {
    user: { id: userId },
  } = useUser();
  const [lastMessage, setLastMessage] = useState(null);

  useEffect(() => {
    const socket = io(SERVER_BASE_URL, {
      auth: { token: userId },
    });
    socket.on("new_message", onNewMessage);
    function onNewMessage(message) {
      setLastMessage(message);
    }
    return () => {
      socket.off("new_message", onNewMessage);
      socket.disconnect();
      // TODO evaluate setLastMessage(null)
    };
  }, [userId]);

  return <WebSocketContext value={lastMessage}>{children}</WebSocketContext>;
}
