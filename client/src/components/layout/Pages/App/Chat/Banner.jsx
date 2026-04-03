import s from "@styles/Banner.module.css";
import { useData, useUser } from "../../../../../hooks";

export default function Banner() {
  const { user } = useUser();
  const { chat } = useData();

  let { avatarUrl, name } = chat;
  if (chat.type === "DIRECT") {
    const otherUser = chat.users.find((u) => u.id !== user.id);
    avatarUrl = otherUser.avatarUrl;
    name = otherUser.username;
  }

  return (
    <div className={s.banner}>
      <img src={avatarUrl} alt="" className={s.avatar} />
      <span>{name}</span>
    </div>
  );
}
