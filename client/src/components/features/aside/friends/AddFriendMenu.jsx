import { arrowLeft, check, cross } from "@lib/icons";
import { useRequests } from "@hooks";
import { IconButton, Loading } from "@components/common";
import MenuTitle from "../shared/MenuTitle";
import Menu from "../shared/Menu";
import RequestInput from "./RequestInput";
import s from "./AddFriendMenu.module.css";
import { useMutation } from "@tanstack/react-query";
import { api } from "@lib/api";

export default function AddFriendMenu({ onGoBackClick, ...props }) {
  const { requests: { sentTo = new Set(), receivedFrom = new Set() } = {} } =
    useRequests();

  const receivedCount = receivedFrom.size;
  const sentCount = sentTo.size;

  return (
    <Menu {...{ ...props }}>
      <MenuTitle src={arrowLeft} alt="back" onClick={onGoBackClick}>
        Add friends
      </MenuTitle>

      <RequestInput />

      <div className={s.requests}>
        {receivedCount > 0 && (
          <>
            <p className={s.requestCount}>Pending requests - {receivedCount}</p>
            <div className={s.list}>
              {Array.from(receivedFrom).map((senderId) => (
                <RequesEntry userId={senderId} type="received" key={senderId} />
              ))}
            </div>
          </>
        )}

        {sentCount > 0 && (
          <>
            <p className={s.requestCount}>Sent requests - {sentCount}</p>
            <div className={s.list}>
              {Array.from(sentTo).map((receiverId) => (
                <RequesEntry userId={receiverId} type="sent" key={receiverId} />
              ))}
            </div>
          </>
        )}
      </div>
    </Menu>
  );
}

function RequesEntry({ userId, type }) {
  const { user: { name, avatarUrl } = {}, isLoading } = useUser(userId, {
    waitAvatar: true,
  });

  const requestMutation = useMutation({
    mutationFn: ({ accept, userId }) =>
      accept ? api.acceptRequest(userId) : api.deleteRequest(userId),
  });

  return (
    <>
      {isLoading ? (
        <div className={s.entry}>
          <Loading className={s.avatar} />
          <Loading className={s.name} />
          {type === "received" && (
            <IconButton variant="loading cancelPadding" />
          )}
          <IconButton variant="loading cancelPadding" />
        </div>
      ) : (
        <div className={s.entry}>
          <img className={s.avatar} src={avatarUrl} />
          <div className={s.name}>{name}</div>
          {type === "received" && (
            <IconButton
              variant="cancelPadding"
              src={check}
              alt="cancel"
              data-accept=""
              data-user-id={userId}
              onClick={handleRequestClick}
            />
          )}
          <IconButton
            variant="cancelPadding"
            src={cross}
            alt="cancel"
            data-user-id={userId}
            onClick={handleRequestClick}
          />
        </div>
      )}
    </>
  );

  function handleRequestClick(e) {
    const { accept, userId } = e.currentTarget.dataset;
    requestMutation.mutate({ accept, userId });
  }
}
