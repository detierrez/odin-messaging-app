import s from "@styles/Requests.module.css";
import { useState } from "react";
import { useApi, useFriends } from "@hooks";
import { useUser } from "@hooks/index";
import { DEFAULT_AVATAR, DEFAULT_USERNAME } from "@lib/defaults";

export default function NewGroupFrom({ onCreate }) {
  const { fetchApi } = useApi();
  const friends = useFriends();
  const [name, setName] = useState("");
  const [selected, setSelected] = useState(new Set());

  if (!friends) {
    return "Loading";
  } else if (friends.length === 0) {
    return "Add friends to create a group chat with them!";
  } else {
    return (
      <>
        <br />
        <button>Upload group picture</button>
        <br />
        <input
          type="text"
          placeholder="Group name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <br />
        <button
          onClick={() => {
            fetchApi(`/chats`, {
              body: { name, memberIds: Array.from(selected) },
            })
              .then(() => {
                console.log("Success creating group");
                onCreate();
              })
              .catch((e) => console.log("Error creating group", e));
          }}
        >
          Create group
        </button>
        <br />
        <h3>Select members</h3>
        <ul>
          {!friends
            ? "Loading"
            : friends.length === 0
              ? "Add friends to create a group"
              : friends.map(({ friendId }) => {
                  return (
                    <li
                      className={s.entry}
                      key={friendId}
                      onClick={() =>
                        setSelected((prev) => {
                          const next = new Set(prev);
                          next.has(friendId)
                            ? next.delete(friendId)
                            : next.add(friendId);
                          return next;
                        })
                      }
                    >
                      <FriendItem
                        friendId={friendId}
                        isSelected={selected.has(friendId)}
                      />
                    </li>
                  );
                })}
        </ul>
      </>
    );
  }
}

function FriendItem({ friendId, isSelected }) {
  const { username, avatarUrl } = useUser(friendId) || {};
  return (
    <>
      <img className={s.avatar} src={avatarUrl ?? DEFAULT_AVATAR} alt="" />
      <span className={s.name}>{username ?? DEFAULT_USERNAME}</span>
      <input
        type="checkbox"
        name="membersIds"
        id="membersIds"
        checked={isSelected}
        readOnly
      />
    </>
  );
}
