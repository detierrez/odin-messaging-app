import { merge } from "@lib/index";
import { arrowRight, cross } from "@lib/icons";
import { Avatar, IconButton, Name } from "@components/common";
import MenuTitle from "../shared/MenuTitle";
import Menu from "../shared/Menu";
import s from "./MemberSelect.module.css";

export default function MemberSelect({
  friends,
  isButtonDisabled,
  checkSelected,
  selectMember,
  onCancelClick,
  onNextClick,
  ...props
}) {
  return (
    <Menu {...{ ...props }}>
      <MenuTitle src={cross} alt="cancel" onClick={onCancelClick}>
        Select Members
      </MenuTitle>
      {!friends ? (
        <p className={s.message}>Loading</p>
      ) : friends.length === 0 ? (
        <p className={s.message}>
          No friends to select!
          <br />
          Add friends to create a group
        </p>
      ) : (
        <>
          <input className={s.search} placeholder="Search for a name" />
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
        className={merge(s.button, isButtonDisabled ? s.disabled : null)}
        src={arrowRight}
        alt="next"
        onClick={onNextClick}
        disabled={isButtonDisabled}
      />
    </Menu>
  );
}
