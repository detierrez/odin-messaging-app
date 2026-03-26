import { useData } from "../../../../../../hooks";
import InboxEntry from "./InboxEntry";

export default function Inbox() {
  const { inbox } = useData();
  return (
    <ul>
      {inbox &&
        inbox.map((message) => {
          return (
            <li key={message.id}>
              <InboxEntry message={message} />
            </li>
          );
        })}
    </ul>
  );
}
