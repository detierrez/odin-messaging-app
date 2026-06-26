import { logout } from "@lib/icons";
import { merge } from "@lib/index";
import { useId, useProfileData } from "@hooks";
import { IconButton } from "@components/common";
import s from "./ProfileControls.module.css";

export default function ProfileControls({
  className,
  onProfileClick,
  ...props
}) {
  const { id: userId } = useId();
  const {
    isLoading,
    data: { avatarUrl },
  } = useProfileData({ userId });

  return (
    <div className={merge(className, s.controls)} {...{ ...props }}>
      <IconButton
        className={s.profile}
        iconClass={s.avatar}
        variant={isLoading && "loading"}
        src={avatarUrl}
        onClick={onProfileClick}
      />
      <IconButton className={s.logout} src={logout} />
    </div>
  );
}
