import { logout } from "@lib/icons";
import { merge } from "@lib/index";
import { useApp, useCache, useIsPreloaded } from "@hooks";
import { IconButton } from "@components/common";
import s from "./ProfileControls.module.css";
import { getUser } from "@lib/api";
import { useEffect, useState } from "react";

export default function ProfileControls({
  className,
  onProfileClick,
  ...props
}) {
  const userId = useApp().profile.id;
  const [n, setN] = useState(2);
  const query = useCache.query(
    ["user", 1],
    (signal) => getUser(1, signal).then((r) => r.user),
    n,
  );

  const [{ username, avatarUrl } = {}, isLoading, error] = query;

  const isPreloaded = useIsPreloaded(avatarUrl);

  const setCache = useCache.set;

  return (
    <div className={merge(className, s.controls)} {...{ ...props }}>
      <button onClick={handleClick}>Fetch profile {n}</button>
      <span>{username}</span>
      {isLoading && !isPreloaded ? (
        <div className={merge(s.loading, s.avatar)}></div>
      ) : (
        <IconButton
          className={s.profile}
          iconClass={s.avatar}
          variant={isLoading && "loading"}
          src={avatarUrl}
          onClick={onProfileClick}
        />
      )}
      <IconButton className={s.logout} src={logout} />
    </div>
  );

  async function handleClick() {
    const { username } = (await getUser(n)).user;
    setN((_n) => ++_n);
    setCache(["user", 1], (old) => ({ ...old, username }));
  }
}
