import s from "@styles/Banner.module.css";
import { useData, useUser } from "@hooks";
import { DEFAULT_AVATAR, DEFAULT_USERNAME } from "@lib/defaults";

export default function Banner() {
  const { chat } = useData();
  const { name, avatarUrl, otherUserId } = chat;
  const otherUser = useUser(otherUserId);

  return (
    <div className={s.banner}>
      <img
        src={avatarUrl ?? otherUser?.avatarUrl ?? DEFAULT_AVATAR}
        alt=""
        className={s.avatar}
      />
      <span>{name ?? otherUser?.username ?? DEFAULT_USERNAME}</span>
    </div>
  );
}
