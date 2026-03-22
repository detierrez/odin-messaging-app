import { useState } from "react";
import { useBackend, useContact, useUser, useWebSocket } from "../../hooks";

export default function Inbox() {
  const lastMessage = useWebSocket();
  const [prevMessage, setPrevMessage] = useState(null);
  const { user, setUser } = useUser();
  const [inbox, setInbox] = useBackend(`/inbox?id=${user.id}`);
  const { setContactId } = useContact();

  if (lastMessage && lastMessage !== prevMessage) {
    setPrevMessage(lastMessage);
    setInbox((prevInbox) => {
      const { fromId, toId } = lastMessage;
      const msgContact = fromId === user.id ? toId : fromId;
      return [
        lastMessage,
        ...prevInbox.filter((i) => {
          const inboxContact = i.fromId === user.id ? i.toId : i.fromId;
          return inboxContact !== msgContact;
        }),
      ];
    });
  }

  return (
    <ul>
      {inbox &&
        inbox.map((message) => {
          const { id, fromId, toId, text } = message;
          const head = fromId === user.id ? "You: " : "";
          const contactId = user.id === fromId ? toId : fromId;
          return (
            <li key={id} onClick={() => setContactId(contactId)}>
              <b>
                {contactId} - {id}
              </b>
              <br />
              {head}
              {text}
            </li>
          );
        })}

      <button onClick={() => setUser({ id: 1 })}>1</button>
      <button onClick={() => setUser({ id: 2 })}>2</button>
      <button onClick={() => setUser({ id: 3 })}>3</button>
      <button onClick={() => setUser({ id: 4 })}>4</button>
      <button onClick={() => setUser({ id: 5 })}>5</button>
      <button onClick={() => setUser({ id: undefined })}>X</button>
    </ul>
  );
}
