import { cross, plus, search } from "@lib/icons";
import { merge } from "@lib/index";
import { useApi, useCurrentChat, useFriends } from "@hooks";
import { Avatar, Heading, IconButton, Name, Surface } from "@components/common";
import s from "./AddMembers.module.css";

export default function AddMembers({ className, onCancelClick, ...props }) {
  const { chat } = useCurrentChat();
  const friends = useFriends();

  const { id: chatId, memberships } = chat;
  const nonMembers = friends.filter(({ friendId }) => !memberships[friendId]);

  return (
    <Surface className={merge(className, s.menu)} {...{ ...props }}>
      <div className={s.heading}>
        <IconButton src={cross} alt="back" onClick={onCancelClick} />
        <span>Add Members</span>
      </div>

      <div className={s.searchWrapper}>
        <img className={s.icon} src={search} alt="" />
        <input
          type="text"
          className={s.search}
          placeholder="Search for a name"
        />
      </div>

      <div className={s.subHeading}>Friends</div>
      <div className={s.list}>
        {nonMembers.length > 0 ? (
          nonMembers.map(({ friendId }) => (
            <InvitationEntry {...{ chatId, friendId }} key={friendId} />
          ))
        ) : (
          <p className={s.placeholderText}>No friends found</p>
        )}
        {nonMembers.length > 0 ? (
          nonMembers.map(({ friendId }) => (
            <InvitationEntry {...{ chatId, friendId }} key={friendId} />
          ))
        ) : (
          <p className={s.placeholderText}>No friends found</p>
        )}
        {nonMembers.length > 0 ? (
          nonMembers.map(({ friendId }) => (
            <InvitationEntry {...{ chatId, friendId }} key={friendId} />
          ))
        ) : (
          <p className={s.placeholderText}>No friends found</p>
        )}
        {nonMembers.length > 0 ? (
          nonMembers.map(({ friendId }) => (
            <InvitationEntry {...{ chatId, friendId }} key={friendId} />
          ))
        ) : (
          <p className={s.placeholderText}>No friends found</p>
        )}
      </div>
    </Surface>
  );
}

function InvitationEntry({ chatId, friendId }) {
  const { addMember } = useApi();

  return (
    <button className={s.entry} onClick={handleClick}>
      <Avatar className={s.avatar} userId={friendId} />
      <Name clasName={s.name} userId={friendId} />
      <img className={s.addIcon} src={plus} alt="add" />
    </button>
  );

  function handleClick() {
    addMember(chatId, friendId);
  }
}
