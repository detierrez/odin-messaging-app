import { useContext } from "react";
import { useState } from "react";
import { useBackend, useContact, useWebSocket } from "../../hooks";
import { UserContext } from "../../contexts/contexts";

export default function Inbox() {
  const lastMessage = useWebSocket();
  const [prevMessage, setPrevMessage] = useState(null);
  const user = useContext(UserContext);
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
    </ul>
  );
}
