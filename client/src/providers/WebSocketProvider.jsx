import { useEffect, useState } from "react";
import io from "socket.io-client";
import { SERVER_BASE_URL } from "../router/actions-loaders";
import { WebSocketContext } from "../contexts/contexts";

const socket = io(SERVER_BASE_URL);

export default function WebSocketProvider({ children }) {
  const [lastMessage, setLastMessage] = useState();

  useEffect(() => {
    const onNewMessage = (message) => {
      console.log(message);
      setLastMessage(message);
    };
    socket.on("new_message", onNewMessage);
    return () => socket.off("new_message", onNewMessage);
  }, []);

  return <WebSocketContext value={lastMessage}>{children}</WebSocketContext>;
}
