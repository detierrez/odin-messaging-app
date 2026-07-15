import { cross, plus, search } from "@lib/icons";
import { merge } from "@lib/index";
import { useApi, useCurrentChat, useFriends } from "@hooks";
import { Avatar, IconButton, Input, Name, Surface } from "@components/common";
import s from "./AddMembers.module.css";
import { useState } from "react";

export default function AddMembers({ className, onCancelClick, ...props }) {
  const { chat } = useCurrentChat();
  const friends = useFriends();
  const [searchText, setSearchText] = useState("");

  const { id: chatId, memberships } = chat;
  const nonMembers = friends.filter(({ friendId }) => !memberships[friendId]);

  return (
    <Surface className={merge(className, s.menu)} {...{ ...props }}>
      <div className={s.heading}>
        <IconButton src={cross} alt="back" onClick={onCancelClick} />
        <span>Add Members</span>
      </div>

      <Input
        className={s.search}
        placeholder="Search for a name"
        icon={search}
        value={searchText}
        buttonIcon={cross}
        onChange={(e) => setSearchText(e.target.value)}
        onIconClick={() => setSearchText("")}
      />

      <div className={s.subHeading}>Friends</div>

      {nonMembers.length === 0 ? (
        <p className={s.placeholderText}>No friends found</p>
      ) : (
        <div className={s.list}>
          {nonMembers.map(({ friendId }) => (
            <InvitationEntry {...{ chatId, friendId }} key={friendId} />
          ))}
        </div>
      )}
    </Surface>
  );
}

function InvitationEntry({ chatId, friendId }) {
  const { addMember } = useApi();

  return (
    <button className={s.entry} onClick={handleClick}>
      <Avatar className={s.avatar} userId={friendId} />
      <Name className={s.name} userId={friendId} />
      <img className={s.addIcon} src={plus} alt="add" />
    </button>
  );

  function handleClick() {
    addMember(chatId, friendId);
  }
}
