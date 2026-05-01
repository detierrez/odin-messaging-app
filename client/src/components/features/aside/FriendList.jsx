import s from "@styles/Requests.module.css";
import { useUser, useFriends, useApi, useSetChat } from "@hooks";
import { DEFAULT_AVATAR, DEFAULT_USERNAME } from "@lib/defaults";

export default function FriendList() {
  const friends = useFriends();
  const { setActiveChatId } = useSetChat();

  return (
    <ul>
      {!friends
        ? "Loading"
        : friends.length === 0
          ? "No friends yet"
          : friends?.map(({ friendId, chatId }) => {
              const handleClick = () => setActiveChatId(chatId);
              return (
                <li className={s.entry} key={chatId} onClick={handleClick}>
                  <FriendEntry friendId={friendId} />
                </li>
              );
            })}
    </ul>
  );
}

function FriendEntry({ friendId }) {
  const { fetchApi } = useApi();
  const { avatarUrl, username } = useUser(friendId) || {};
  return (
    <>
      <img className={s.avatar} src={avatarUrl ?? DEFAULT_AVATAR} alt="" />
      <span className={s.name}>{username ?? DEFAULT_USERNAME}</span>
      <button
        className={s.button}
        onClick={(e) => {
          e.stopPropagation();
          fetchApi(`/friends/${friendId}`, {
            method: "DELETE",
          })
            .then(() => console.log(`Friend ${friendId} removed successfully`))
            .catch((error) => console.log(`Error removing friend: ${error}`));
        }}
      >
        -
      </button>
    </>
  );
}
