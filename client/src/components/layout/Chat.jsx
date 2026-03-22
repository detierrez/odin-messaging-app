import { useState } from "react";
import TextBox from "./TextBox";
import { useBackend, useContact, useUser, useWebSocket } from "../../hooks";
import Banner from "./Banner";

export default function Chat() {
  const lastMessage = useWebSocket();
  const [prevMessage, setPrevMessage] = useState(null);
  const { contactId } = useContact();
  const { user } = useUser();
  const [chat, setChat] = useBackend(
    `/contacts/${contactId}/messages?id=${user.id}`,
  );

  if (lastMessage && lastMessage !== prevMessage) {
    const { fromId, toId } = lastMessage;
    const msgContact = fromId === user.id ? toId : fromId;
    if (msgContact === contactId) {
      setPrevMessage(lastMessage);
      setChat((prevChat) => [lastMessage, ...prevChat]);
    }
  }

  return (
    <>
      <Banner />
      <TextBox action={`/contacts/${contactId}/messages?id=${user.id}`} />

      <ul>{chat && chat.map((m) => <li key={m.id}>{m.text}</li>)}</ul>
    </>
  );
}
