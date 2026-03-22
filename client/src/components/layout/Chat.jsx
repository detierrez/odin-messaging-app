import { useContext } from "react";
import { fetchBackend, SERVER_BASE_URL } from "../../router/actions-loaders";
import { useState } from "react";
import TextBox from "./TextBox";
import { useBackend } from "../../hooks";
import { WebSocketContext } from "../../contexts/contexts";

export default function Chat() {
  const lastMessage = useContext(WebSocketContext);
  const [prevMessage, setPrevMessage] = useState(null);
  const [chat, setChat] = useState([]);

  const [contactId, setContactId] = useState(5);
  const userId = 3;
  const path = `/contacts/${contactId}/messages?id=${userId}`;
  useBackend(path, setChat);

  if (lastMessage && lastMessage !== prevMessage) {
    setPrevMessage(lastMessage);
    setChat((prevChat) => [lastMessage, ...prevChat]);
  }

  console.log("Chat:", lastMessage);

  return (
    <>
      <TextBox action={path} />

      <ul>
        {chat.map((m) => (
          <li key={m.id}>{m.text}</li>
        ))}
      </ul>
    </>
  );
}
