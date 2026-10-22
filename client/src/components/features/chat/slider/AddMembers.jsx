import { cross, plus, search } from "@lib/icons";
import { merge } from "@lib/index";
import { useCurrentProfile, useFriends, useUser } from "@hooks";
import { IconButton, Input, Loading, Surface } from "@components/common";
import s from "./AddMembers.module.css";
import { useState } from "react";

export default function AddMembers({ className, onCancelClick, ...props }) {
  const { friends } = useFriends();
  const { profile: { id: groupId, participations } = {} } = useCurrentProfile();
  const [searchText, setSearchText] = useState("");

  const nonMembers = new Set(friends);
  participations?.forEach((p) => nonMembers.delete(p.userId));

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

      {nonMembers.size === 0 ? (
        <p className={s.placeholderText}>No friends found</p>
      ) : (
        <div className={s.list}>
          {[...nonMembers].map((userId) => (
            <InvitationEntry {...{ groupId, userId }} key={userId} />
          ))}
        </div>
      )}
    </Surface>
  );
}

function InvitationEntry({ groupId, userId }) {
  const { user, isLoading } = useUser(userId, { waitAvatar: true });

  return isLoading ? (
    <button className={s.entry}>
      <Loading className={s.avatar} />
      <Loading className={s.name} />
      <Loading className={s.addIcon} />
    </button>
  ) : (
    <button className={s.entry} onClick={handleClick}>
      <img className={s.avatar} src={user.avatarUrl} alt="" />
      <div className={s.name}>{user.name}</div>
      <img className={s.addIcon} src={plus} alt="add" />
    </button>
  );

  function handleClick() {
    // addMember(groupId, userId); // APICALL
  }
}
