import { merge } from "@lib/index";
import { useCurrentProfile } from "@hooks";
import { Dropdown, IconButton, Loading, Surface } from "@components/common";
import s from "./Banner.module.css";

export default function Banner({ className, onInfoClick }) {
  const { profile: { name, avatarUrl } = {}, isLoading } = useCurrentProfile();

  return isLoading ? (
    <Surface className={merge(className, s.banner)}>
      <Loading className={s.avatar} />
      <Loading className={s.name} />
      <IconButton variant="loading cancelPadding" />
    </Surface>
  ) : (
    <Surface className={merge(className, s.banner)}>
      <img className={s.avatar} src={avatarUrl} alt="" onClick={onInfoClick} />
      <div className={s.name} onClick={onInfoClick}>
        {name}
      </div>
      <Options onInfoClick={onInfoClick} />
    </Surface>
  );
}

function Options({ onInfoClick }) {
  const {
    profile: { id: profileId, isGroup, isActive, isAdmin },
  } = useCurrentProfile();

  if (isGroup && !isActive) return;

  return (
    <Dropdown>
      <button onClick={onInfoClick}>More info.</button>
      {isGroup ? (
        <>
          <button onClick={handleLeave}>Leave</button>
          {isAdmin && <button onClick={handleClose}>Close</button>}
        </>
      ) : (
        <>
          {isActive ? (
            <button onClick={handleUnfriend}>Unfriend</button>
          ) : (
            <button onClick={handleSendRequest}>Add friend</button>
          )}
        </>
      )}
    </Dropdown>
  );

  function handleUnfriend() {
    // removeFriend(profileId); // APICALL
  }

  function handleSendRequest() {
    // sendRequest(profileId);
  }

  function handleLeave() {
    // leaveGroup(profileId);
  }

  function handleClose() {
    // closeGroup(profileId);
  }
}
