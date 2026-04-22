import s from "@styles/Requests.module.css";
import { useData, useUser } from "@hooks";
import { fetchBackend } from "@lib";

export default function SentRequests() {
  const { user } = useUser();
  const {
    requests: { sentTo },
  } = useData() || {};

  return (
    <ul>
      {sentTo?.map((otherUser) => {
        const { id, username, avatarUrl } = otherUser;
        return (
          <li className={s.entry} key={id}>
            <img className={s.avatar} src={avatarUrl} alt="" />
            <span className={s.name}>{username}</span>
            <button
              className={s.button}
              onClick={() => {
                fetchBackend(`/requests/${id}?id=${user.id}`, {
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
  );
}
