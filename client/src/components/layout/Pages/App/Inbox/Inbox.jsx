import Contact from "./Contact";

export default function Inbox({ inbox }) {
  return (
    <ul>
      {inbox &&
        inbox.map((message) => {
          return (
            <li key={message.id}>
              <Contact {...{ ...message }} />
            </li>
          );
        })}
    </ul>
  );
}
