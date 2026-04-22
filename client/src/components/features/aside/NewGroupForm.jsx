import s from "@styles/Requests.module.css";
import { useState } from "react";
import { useUser, useFriends } from "@hooks";
import { fetchBackend } from "@lib";

export default function NewGroupFrom({ onCreate }) {
  const { user } = useUser();
  const friends = useFriends();
  const [name, setName] = useState("");
  const [selected, setSelected] = useState(new Set());

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
          fetchBackend(`/groups?id=${user.id}`, {
            body: { name, membersIds: Array.from(selected) },
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
        {friends?.map(({ id: friendId, avatarUrl, username }) => {
          return (
            <li className={s.entry} key={friendId}>
              <img className={s.avatar} src={avatarUrl} alt="" />
              <span className={s.name}>{username}</span>
              <input
                type="checkbox"
                name="membersIds"
                id="membersIds"
                checked={selected.has(friendId)}
                onChange={() =>
                  setSelected((prev) => {
                    const copy = new Set(prev);
                    copy.has(friendId)
                      ? copy.delete(friendId)
                      : copy.add(friendId);
                    return copy;
                  })
                }
                readOnly
              />
            </li>
          );
        })}
      </ul>
    </>
  );
}
