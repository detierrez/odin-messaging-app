import { useId, useCurrentChat } from "@hooks";
import { Avatar, Name } from "@components/common";
import TimeTag from "./TimeTag";
import s from "./InboxEntry.module.css";

export default function InboxEntry({ chatId, lastMessage }) {
  const { id: userId } = useId();
  const { setCurrentChat } = useCurrentChat();
  const { sentAt, content, userId: authorId } = lastMessage;

  return (
    <button className={s.entry} onClick={() => setCurrentChat(chatId)}>
      <Avatar className={s.avatar} chatId={chatId} />
      <Name className={s.name} chatId={chatId} />
      <TimeTag className={s.date} date={sentAt} />
      <div className={s.content}>
        <span className={s.prepend}>{authorId === userId ? "You: " : ""}</span>
        {content}
      </div>
    </button>
  );
}
