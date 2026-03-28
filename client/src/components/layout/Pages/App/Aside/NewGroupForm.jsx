import { useState } from "react";
import { useUser, useData } from "../../../../../hooks";
import { fetchBackend } from "../../../../../router/actions-loaders";

export default function NewGroupFrom() {
  const { user } = useUser();
  const { friends } = useData();
  const [name, setName] = useState(null);
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
            body: { name, friendIds: selected },
          });
        }}
      >
        Create group
      </button>
      <br />
      <h3>Select members</h3>
      <ul>
        {friends &&
          friends.map((friend) => {
            return (
              <li className="friend" key={friend.id}>
                <b>{friend.id}</b>
                <input
                  type="checkbox"
                  name="friends"
                  id="friends"
                  checked={selected.has(friend.id)}
                  onChange={() =>
                    setSelected((prev) => {
                      const copy = new Set(prev);
                      copy.has(friend.id)
                        ? copy.delete(friend.id)
                        : copy.add(friend.id);
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
