import { useApp, useSystemMessage, useTimeTag } from "@hooks";
import { Avatar, Name } from "@components/common";
import s from "./InboxEntry.module.css";
import { merge } from "@lib/index";

export default function InboxEntry({ message, ...props }) {
  const { type, chatId, sentAt } = message;
  const timeTag = useTimeTag(sentAt);
  const isSystemMessage = type !== "USER_MESSAGE";

  console.log({ message });

  return (
    <button className={s.entry} {...props}>
      <Avatar className={s.avatar} chatId={chatId} />
      {/* <Name className={s.name} chatId={chatId} /> */}
      <span className={s.date}>{timeTag}</span>
      <div className={merge(s.text, isSystemMessage && s.system)}>
        {isSystemMessage ? (
          <SystemText {...message} />
        ) : (
          <UserText {...message} />
        )}
      </div>
    </button>
  );
}

function SystemText(message) {
  // const text = useSystemMessage(message);
  // return text;
}

function UserText({ userId: authorId, content }) {
  const userId = useApp().profile.id;

  return (
    <>
      {authorId === userId && <span className={s.prepend}>You: </span>}
      {content}
    </>
  );
}
