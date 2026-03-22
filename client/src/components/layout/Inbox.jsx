import { useContext } from "react";
import { useState } from "react";
import { useBackend } from "../../hooks";
import { UserContext, WebSocketContext } from "../../contexts/contexts";

export default function Inbox() {
  const lastMessage = useContext(WebSocketContext);
  const [prevMessage, setPrevMessage] = useState(null);
  const user = useContext(UserContext);
  const [inbox, setInbox] = useState([]);
  useBackend(`/inbox?id=${user.id}`, setInbox);

  if (lastMessage && lastMessage !== prevMessage) {
    setPrevMessage(lastMessage);
    setInbox((prevInbox) => {
      const { fromId, toId } = lastMessage;
      const contactId = fromId === user.id ? toId : fromId;
      const newInbox = prevInbox.filter(
        (message) => message.fromId !== contactId && message.toId !== contactId,
      );
      newInbox.unshift(lastMessage);
      return newInbox;
    });
  }

  return (
    <ul>
      {inbox.map((message) => {
        const { id, fromId, toId, text } = message;
        const head = fromId === user.id ? "You: " : "";
        const contactId = fromId === user.id ? toId : fromId;
        return (
          <li key={id}>
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
