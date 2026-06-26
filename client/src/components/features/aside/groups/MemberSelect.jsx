import { merge } from "@lib/index";
import { arrowRight, cross, search } from "@lib/icons";
import { Avatar, IconButton, Input, Name } from "@components/common";
import MenuTitle from "../shared/MenuTitle";
import Menu from "../shared/Menu";
import s from "./MemberSelect.module.css";
import { useState } from "react";

export default function MemberSelect({
  friends,
  isButtonDisabled,
  checkSelected,
  selectMember,
  onCancelClick,
  onNextClick,
  ...props
}) {
  const [searchText, setSearchText] = useState("");

  return (
    <Menu {...{ ...props }}>
      <MenuTitle src={cross} alt="cancel" onClick={onCancelClick}>
        Select Members
      </MenuTitle>
      <Input
        className={s.search}
        icon={search}
        value={searchText}
        onChange={handleSearchChange}
        onCancelClick={handleSearchCancel}
        placeholder="Search for a name"
      />
      {!friends ? (
        <p className={s.placeholderText}>Loading</p>
      ) : friends.length === 0 ? (
        <p className={s.placeholderText}>No friends found</p>
      ) : (
        <>
          <div className={s.subheading}>Friends - {friends.length}</div>
          <div className={s.list}>
            {friends.map(({ friendId }) => (
              <button
                className={s.entry}
                key={friendId}
                onClick={() => selectMember(friendId)}
              >
                <input
                  className={s.checkbox}
                  type="checkbox"
                  name="membersIds"
                  id="membersIds"
                  checked={checkSelected(friendId)}
                  readOnly
                />
                <Avatar className={s.avatar} userId={friendId} />
                <Name userId={friendId} />
              </button>
            ))}
          </div>
        </>
      )}
      <IconButton
        className={merge(s.button)}
        variant="accent"
        src={arrowRight}
        alt="next"
        isAccent={true}
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
