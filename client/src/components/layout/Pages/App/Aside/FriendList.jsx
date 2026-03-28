import { useUser, useData } from "../../../../../hooks";
import { fetchBackend } from "../../../../../router/actions-loaders";

export default function FriendList() {
  const { user } = useUser();
  const { friends } = useData();

  return (
    <ul>
      {friends &&
        friends.map((friend) => {
          return (
            <li className="friend" key={friend.id}>
              <b>{friend.id}</b>
              <button
                onClick={() => {
                  fetchBackend(`/friends/${friend.id}?id=${user.id}`, {
                    method: "DELETE",
                  })
                    .then(() =>
                      console.log(`Friend ${friend.id} removed successfully`),
                    )
                    .catch((error) =>
                      console.log(`Error removing friend: ${error}`),
                    );
                }}
              >
                Remove
              </button>
            </li>
          );
        })}
    </ul>
  );
}
