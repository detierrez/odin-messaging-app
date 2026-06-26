import { plus } from "@lib/icons";
import { merge } from "@lib/index";
import { useApi, useCurrentChat, useId, useUsers } from "@hooks";
import { Avatar, Dropdown, IconButton, Name } from "@components/common";
import s from "./Members.module.css";

export default function MemberList({ className, onMoreClick, ...props }) {
  const { id: chatId, memberships, isUserAdmin } = useCurrentChat().chat;
  const { users } = useUsers();

  const sortedMemberships = Object.entries(memberships).toSorted(
    ([idA, roleA], [idB, roleB]) => {
      const nameA = users[idA]?.alias ?? users[idA]?.username;
      const nameB = users[idB]?.alias ?? users[idB]?.username;

      if (roleA !== roleB) {
        return roleA === "ADMIN" ? -1 : 1;
      }

      return nameA?.localeCompare(nameB);
    },
  );

  return (
    <div className={merge(className, s.members)} {...{ ...props }}>
      <div className={s.heading}>
        <p className={s.title}>Members - {Object.keys(memberships).length}</p>
        {isUserAdmin && (
          <IconButton
            variant="cancelPadding"
            className={s.addMembers}
            src={plus}
            alt="back"
            onClick={onMoreClick}
          />
        )}
      </div>
      <div className={s.list}>
        {sortedMemberships.map(([memberId, role]) => (
          <Member
            {...{ memberId: Number(memberId), role, chatId, isUserAdmin }}
            key={memberId}
          />
        ))}
      </div>
    </div>
  );
}

function Member({ memberId, role, chatId, isUserAdmin }) {
  const { updateMember, removeMember } = useApi();
  const { id: userId } = useId();

  const isMemberAdmin = role === "ADMIN";
  const roleAction = isMemberAdmin ? "Demote" : "Promote";
  const nextRole = isMemberAdmin ? "MEMBER" : "ADMIN";

  return (
    <div className={s.membership}>
      <Avatar className={s.avatar} userId={memberId} />
      <div className={s.verticalWrapper}>
        <Name className={s.username} userId={memberId} />
        {isMemberAdmin && <div className={s.role}>Administrator</div>}
      </div>
      {isUserAdmin && memberId !== userId ? (
        <Dropdown className={s.options} title={"⋮"}>
          <button onClick={() => updateMember(chatId, memberId, nextRole)}>
            {roleAction}
          </button>
          <button onClick={() => removeMember(chatId, memberId)}>Remove</button>
        </Dropdown>
      ) : (
        <div className={s.options}></div>
      )}
    </div>
  );
}
