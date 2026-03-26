import InboxEntry from "./InboxEntry";

export default function Inbox({ inbox }) {
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
