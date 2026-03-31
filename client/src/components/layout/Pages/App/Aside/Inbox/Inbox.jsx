import { useData } from "../../../../../../hooks";
import InboxEntry from "./InboxEntry";

export default function Inbox() {
  const { inbox } = useData();
  return (
    <ul>
      {inbox?.map((entry) => {
        return (
          <li key={entry.chatId}>
            <InboxEntry entry={entry} />
          </li>
        );
      })}
    </ul>
  );
}
