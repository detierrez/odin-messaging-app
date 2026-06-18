import { arrowLeft, check, cross } from "@lib/icons";
import { useApi, useRequests } from "@hooks";
import { Avatar, IconButton, Name } from "@components/common";
import MenuTitle from "../shared/MenuTitle";
import Menu from "../shared/Menu";
import RequestInput from "./RequestInput";
import s from "./AddFriendMenu.module.css";

export default function AddFriendMenu({ onGoBackClick, ...props }) {
  const { deleteRequest, acceptRequest } = useApi();
  const { sentTo = [], receivedFrom = [] } = useRequests().requests ?? {};

  const { size: receivedCount } = receivedFrom;
  const { size: sentCount } = sentTo;

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
              {Array.from(receivedFrom).map((receiverId) => (
                <div className={s.entry} key={receiverId}>
                  <Avatar className={s.avatar} userId={receiverId} />
                  <Name userId={receiverId} />
                  <IconButton
                    src={check}
                    alt="cancel"
                    onClick={() => acceptRequest(receiverId)}
                  />
                  <IconButton
                    src={cross}
                    alt="cancel"
                    onClick={() => deleteRequest(receiverId)}
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {sentCount > 0 && (
          <>
            <p className={s.requestCount}>Sent requests - {sentCount}</p>
            <div className={s.list}>
              {Array.from(sentTo).map((senderId) => (
                <div className={s.entry} key={senderId}>
                  <Avatar className={s.avatar} userId={senderId} />
                  <Name userId={senderId} />
                  <IconButton
                    src={cross}
                    alt="cancel"
                    onClick={() => deleteRequest(senderId)}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Menu>
  );
}
