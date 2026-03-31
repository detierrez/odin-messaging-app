import s from "@styles/Requests.module.css";
import { useUser, useData } from "../../../../../hooks";
import { fetchBackend } from "../../../../../router/actions-loaders";

export default function FriendList() {
  const { user } = useUser();
  const { friends } = useData();

  return (
    <ul>
      {friends?.map((friend) => {
        const { id: friendId, username, avatarUrl } = friend;
        return (
          <li className={s.entry} key={friendId}>
            <img className={s.avatar} src={avatarUrl} alt="" />
            <span className={s.username}>{username}</span>
            <button
              className={s.button}
              onClick={() => {
                fetchBackend(`/friends/${friendId}?id=${user.id}`, {
                  method: "DELETE",
                })
                  .then(() =>
                    console.log(`Friend ${friendId} removed successfully`),
                  )
                  .catch((error) =>
                    console.log(`Error removing friend: ${error}`),
                  );
              }}
            >
              -
            </button>
          </li>
        );
      })}
    </ul>
  );
}
