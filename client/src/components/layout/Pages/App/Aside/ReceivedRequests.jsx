import s from "@styles/Requests.module.css";
import { useData, useUser } from "../../../../../hooks";
import { fetchBackend } from "../../../../../router/actions-loaders";

export default function ReceivedRequests() {
  const { user } = useUser();
  const {
    requests: { receivedFrom },
  } = useData() ?? {};

  console.log({ receivedFrom });
  return (
    receivedFrom.length > 0 && (
      <ul>
        <h3>Friend requests</h3>
        {receivedFrom?.map((otherUser) => {
          const { id: otherUserId, username, avatarUrl } = otherUser;
          return (
            <li className={s.entry} key={otherUserId}>
              <img className={s.avatar} src={avatarUrl} alt="" />
              <span className={s.username}>{username}</span>
              <button
                className={s.button}
                onClick={() => {
                  fetchBackend(
                    `/requests/${otherUserId}/accept?id=${user.id}`,
                    {
                      method: "POST",
                    },
                  );
                }}
              >
                ✓
              </button>{" "}
              <button
                className={s.button}
                onClick={() => {
                  fetchBackend(`/requests/${otherUserId}?id=${user.id}`, {
                    method: "DELETE",
                  });
                }}
              >
                ×
              </button>
            </li>
          );
        })}
      </ul>
    )
  );
}
