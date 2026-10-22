import { logout } from "@lib/icons";
import { merge } from "@lib/index";
import { useOwnId, useUser } from "@hooks";
import { IconButton } from "@components/common";
import s from "./ProfileControls.module.css";
import { useNavigate } from "react-router";

export default function ProfileControls({
  className,
  onProfileClick,
  ...props
}) {
  const navigate = useNavigate();
  const ownId = useOwnId();
  const { isLoading, user: { avatarUrl } = {} } = useUser(ownId, {
    waitAvatar: true,
  });

  return (
    <div className={merge(className, s.controls)} {...{ ...props }}>
      <IconButton
        className={s.profile}
        iconClass={s.avatar}
        variant={isLoading && "loading"}
        src={avatarUrl}
        onClick={onProfileClick}
      />
      <IconButton
        className={s.logout}
        src={logout}
        onClick={handleLogoutClick}
      />
    </div>
  );

  function handleLogoutClick() {
    navigate("/logout");
  }
}
