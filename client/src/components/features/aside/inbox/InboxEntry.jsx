import { useSetChat } from "@hooks";
import s from "@styles/InboxEntry.module.css";

export default function InboxEntry({ entry }) {
  const { setActiveChatId } = useSetChat();
  const { chatId, name, avatarUrl, lastMessage } = entry;
  return (
    <div className={s.entry} onClick={() => setActiveChatId(chatId)}>
      <img src={avatarUrl} alt="" className={s.avatar} />
      <span className={s.name}>{name}</span>
      <span className={s.date}>{lastMessage.id}</span>
      <div className={s.text}>{lastMessage.text}</div>
    </div>
  );
}
