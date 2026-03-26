import { useActiveFriend, useUser } from "../../../../../../hooks";
import s from "@styles/InboxEntry.module.css";
import { getFriendId } from "../../../../../../utils";

export default function InboxEntry({ message }) {
  const { user } = useUser();
  const { setActiveFriend } = useActiveFriend();
  const friendId = getFriendId(user.id, message);
  return (
    <div className={s.entry} onClick={() => setActiveFriend({ id: friendId })}>
      <div className={s.top}>
        <span className={s.friendName}>{friendId}</span>{" "}
        <span className={s.date}>{message.id}</span>
      </div>
      <div className={s.bot}>
        <span className={s.prepend}>
          {message.fromId === user.id ? "You: " : ""}
        </span>
        {message.text}
      </div>
    </div>
  );
}
