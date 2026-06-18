import { arrowLeft, plus } from "@lib/icons";
import { merge } from "@lib/index";
import { useApi, useCurrentChat, useFriends } from "@hooks";
import { Avatar, Heading, IconButton, Name } from "@components/common";
import s from "./AddMembers.module.css";

export default function AddMembers({
  className: propsClass,
  onGoBackClick,
  ...props
}) {
  const { chat } = useCurrentChat();
  const friends = useFriends();

  const { id: chatId, memberships } = chat;
  const nonMembers = friends.filter(({ friendId }) => !memberships[friendId]);

  return (
    <div className={merge(propsClass, s.members)} {...{ ...props }}>
      <div className={s.heading}>
        <IconButton src={arrowLeft} alt="back" onClick={onGoBackClick} />
        <Heading>Add Members</Heading>
      </div>

      {nonMembers.length > 0 ? (
        <div className={s.list}>
          {nonMembers.map(({ friendId }) => (
            <InvitationEntry {...{ chatId, friendId }} key={friendId} />
          ))}
        </div>
      ) : (
        <p className={s.messsage}>
          No friends to invite. Add more friends and invite them to this group!
        </p>
      )}
    </div>
  );
}

function InvitationEntry({ chatId, friendId }) {
  const { addMember } = useApi();

  return (
    <div className={s.entry}>
      <Avatar className={s.avatar} userId={friendId} />
      <Name clasName={s.name} userId={friendId} />
      <IconButton
        src={plus}
        alt="add member"
        onClick={() => addMember(chatId, friendId)}
      />
    </div>
  );
}
