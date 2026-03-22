import { useState } from "react";
import TextBox from "./TextBox";
import { useBackend, useContact, useWebSocket } from "../../hooks";

export default function Chat() {
  const lastMessage = useWebSocket();
  const [prevMessage, setPrevMessage] = useState(null);

  const { contactId } = useContact();
  const userId = 3;
  const [chat, setChat] = useBackend(
    `/contacts/${contactId}/messages?id=${userId}`,
  );

  if (lastMessage && lastMessage !== prevMessage) {
    setPrevMessage(lastMessage);
    setChat((prevChat) => [lastMessage, ...prevChat]);
  }

  console.log("Chat:", lastMessage);

  return (
    <>
      {contactId}
      <TextBox action={`/contacts/${contactId}/messages?id=${userId}`} />

      <ul>{chat && chat.map((m) => <li key={m.id}>{m.text}</li>)}</ul>
    </>
  );
}
