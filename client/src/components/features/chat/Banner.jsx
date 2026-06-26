import { merge } from "@lib/index";
import { useApi, useCurrentChat, useUser } from "@hooks";
import { Avatar, Dropdown, Name, Surface } from "@components/common";
import s from "./Banner.module.css";

export default function Banner({ className, onInfoClick }) {
  const { id: chatId } = useCurrentChat().chat;

  return (
    <Surface className={merge(className, s.banner)}>
      <Avatar className={s.avatar} chatId={chatId} onClick={onInfoClick} />
      <Name className={s.name} chatId={chatId} onClick={onInfoClick} />
      <Options onInfoClick={onInfoClick} />
    </Surface>
  );
}

function Options({ onInfoClick }) {
  const { sendRequest, removeFriend, leaveGroup, closeGroup } = useApi();
  const {
    id: chatId,
    isDirect,
    isFriend,
    isUserAdmin,
    otherUserId,
    isActive,
  } = useCurrentChat().chat;
  const { username } = useUser(otherUserId) || {};

  if (!isDirect && !isActive) return;

  return (
    <Dropdown>
      <button onClick={onInfoClick}>Chat info.</button>
      {isDirect ? (
        isFriend ? (
          <button onClick={() => removeFriend(otherUserId)}>Unfriend</button>
        ) : (
          <button onClick={() => sendRequest(username)}>Add friend</button>
        )
      ) : (
        <>
          <button onClick={() => leaveGroup(chatId)}>Leave</button>
          {isUserAdmin && (
            <button onClick={() => closeGroup(chatId)}>Close</button>
          )}
        </>
      )}
    </Dropdown>
  );
}
