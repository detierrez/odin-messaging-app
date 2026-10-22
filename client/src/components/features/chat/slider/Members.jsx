import { plus } from "@lib/icons";
import { merge } from "@lib/index";
import { useCurrentProfile, useOwnId, useUser } from "@hooks";
import { Dropdown, IconButton, Loading } from "@components/common";
import s from "./Members.module.css";

export default function Members({ className, onMoreClick, ...props }) {
  const { profile: { participations, isAdmin } = {} } = useCurrentProfile();

  if (!participations) return;

  const sortedParticipations = participations.toSorted((pA, pB) => {
    pA.role === pB.role
      ? pA.name?.localeCompare(pB.name)
      : pA.role === "ADMIN"
        ? -1
        : 1;
  });

  return (
    <div className={merge(className, s.members)} {...{ ...props }}>
      <div className={s.heading}>
        <p className={s.title}>Members - {sortedParticipations.length}</p>
        {isAdmin && (
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
        {sortedParticipations.map(({ userId, role }) => (
          <Member {...{ userId, role }} key={userId} />
        ))}
      </div>
    </div>
  );
}

function Member({ userId, role }) {
  const ownId = useOwnId();
  const {
    profile: { id: groupId },
    isAdmin,
  } = useCurrentProfile();
  const { user, isLoading } = useUser(userId, { waitAvatar: true });

  const isMemberAdmin = role === "ADMIN";
  const roleAction = isMemberAdmin ? "Demote" : "Promote";
  const nextRole = isMemberAdmin ? "MEMBER" : "ADMIN";

  return isLoading ? (
    <div className={s.membership}>
      <Loading className={s.avatar} />
      <div className={s.verticalWrapper}>
        <Loading className={s.username} />
        <Loading className={s.role} />
      </div>
    </div>
  ) : (
    <div className={s.membership}>
      <img className={s.avatar} src={user.avatarUrl} alt="" />
      <div className={s.verticalWrapper}>
        <div className={s.username}>{user.name}</div>
        {isMemberAdmin && <div className={s.role}>Administrator</div>}
      </div>
      {isAdmin && userId !== ownId && (
        <Dropdown className={s.options} title={"⋮"}>
          <button onClick={handleUpdate}>{roleAction}</button>
          <button onClick={handleRemove}>Remove</button>
        </Dropdown>
      )}
    </div>
  );

  function handleUpdate() {
    // updateMember(groupId, userId, nextRole); // APICALL
  }

  function handleRemove() {
    // removeMember(groupId, userId);
  }
}
