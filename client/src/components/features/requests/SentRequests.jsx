import s from "@styles/Requests.module.css";
import { useData, useApi } from "@hooks";
import { useUser } from "@hooks/index";
import { DEFAULT_AVATAR, DEFAULT_USERNAME } from "@lib/defaults";

export default function SentRequests() {
  const { sentTo = [] } = useData()?.requests ?? {};

  return (
    sentTo.size > 0 && (
      <ul>
        <h3>Pending requests</h3>
        {Array.from(sentTo).map((receiverId) => {
          return (
            <li className={s.entry} key={receiverId}>
              <RequestEntry userId={receiverId} />
            </li>
          );
        })}
      </ul>
    )
  );
}

function RequestEntry({ userId }) {
  const { fetchApi } = useApi();
  const { username, avatarUrl } = useUser(userId) || {};

  return (
    <>
      <img className={s.avatar} src={avatarUrl ?? DEFAULT_AVATAR} alt="" />
      <span className={s.name}>{username ?? DEFAULT_USERNAME}</span>
      <button
        className={s.button}
        onClick={() => {
          fetchApi(`/requests/${userId}`, { method: "DELETE" })
            .then(() =>
              console.log(`Success deleting friend request: ${userId}`),
            )
            .catch((e) => console.log(`Error deleting friend request: ${e}`));
        }}
      >
        ×
      </button>
    </>
  );
}
