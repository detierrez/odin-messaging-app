import { merge } from "@lib/index";
import { arrowRight, cross, search } from "@lib/icons";
import { IconButton, Input, Loading } from "@components/common";
import MenuTitle from "../shared/MenuTitle";
import Menu from "../shared/Menu";
import s from "./MemberSelect.module.css";
import { useState } from "react";
import { useFriends, useUser } from "@hooks";

export default function MemberSelect({
  isButtonDisabled,
  checkSelected,
  selectMember,
  onCancelClick,
  onNextClick,
  ...props
}) {
  const [searchText, setSearchText] = useState("");
  const { friends, isLoading } = useFriends();
  const friendsCount = friends.size;

  if (isLoading) return <div>Loading...</div>;
  return (
    <Menu {...{ ...props }}>
      <MenuTitle src={cross} alt="cancel" onClick={onCancelClick}>
        Select Members
      </MenuTitle>
      <Input
        className={s.search}
        placeholder="Search for a name"
        icon={search}
        value={searchText}
        buttonIcon={cross}
        onChange={handleSearchChange}
        onIconClick={handleSearchCancel}
      />
      {friendsCount === 0 ? (
        <p className={s.placeholderText}>No friends found</p>
      ) : (
        <>
          <div className={s.subheading}>Friends - {friendsCount}</div>
          <div className={s.list}>
            {[...friends].map((friendId) => (
              <FriendEntry
                className={s.entry}
                key={friendId}
                friendId={friendId}
                isSelected={checkSelected(friendId)}
                onClick={() => selectMember(friendId)}
              />
            ))}
          </div>
        </>
      )}
      <IconButton
        className={merge(s.button)}
        variant="accent"
        src={arrowRight}
        alt="next"
        onClick={onNextClick}
        disabled={isButtonDisabled}
      />
    </Menu>
  );

  function handleSearchChange(e) {
    setSearchText(e.target.value);
  }
  function handleSearchCancel() {
    setSearchText("");
  }
}

function FriendEntry({ friendId, isSelected, ...props }) {
  const { user, isLoading } = useUser(friendId, { waitAvatar: true });

  return (
    <>
      {isLoading ? (
        <button className={s.entry} {...props}>
          <Loading className={s.checkbox} />
          <Loading className={s.avatar} />
          <Loading className={s.name} />
        </button>
      ) : (
        <button className={s.entry} {...props}>
          <input
            className={s.checkbox}
            type="checkbox"
            name="membersIds"
            id="membersIds"
            checked={isSelected}
            readOnly
          />
          <img className={s.avatar} src={user.avatarUrl} alt="" />
          <div>{user.name}</div>
        </button>
      )}
    </>
  );
}
