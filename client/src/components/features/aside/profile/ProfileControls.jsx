import { logout } from "@lib/icons";
import { merge } from "@lib/index";
import { useId } from "@hooks";
import { Avatar, IconButton } from "@components/common";
import s from "./ProfileControls.module.css";

export default function ProfileControls({
  className,
  onProfileClick,
  ...props
}) {
  const { id } = useId();

  return (
    <div className={merge(className, s.controls)} {...{ ...props }}>
      <button className={s.button} onClick={onProfileClick}>
        <Avatar className={s.avatar} userId={id} />
      </button>
      <IconButton className={s.button} src={logout} />
    </div>
  );
}
