import { merge } from "@lib/index";
import { useProfileData } from "@hooks";
import s from "./Avatar.module.css";
import { DEFAULT_GROUP_AVATAR } from "@lib/images";

export default function Avatar({ className, chatId, userId, ...props }) {
  const {
    isLoading,
    data: { avatarUrl },
  } = useProfileData({ chatId, userId });

  return isLoading ? (
    <div
      className={merge(className, s.avatar, s.loading)}
      {...{ ...props }}
    ></div>
  ) : (
    <img
      className={merge(className, s.avatar)}
      src={avatarUrl ?? DEFAULT_GROUP_AVATAR}
      alt=""
      {...{ ...props }}
    />
  );
}
