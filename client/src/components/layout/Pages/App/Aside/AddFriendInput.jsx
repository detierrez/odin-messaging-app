import { useState } from "react";
import { fetchBackend } from "../../../../../router/actions-loaders";
import { useUser } from "../../../../../hooks";

export default function AddFriendInput() {
  const { user } = useUser();
  const [username, setUsername] = useState("");

  const isValidUsername = !!username.trim();

  const sendFriendRequest = () => {
    setUsername("");

    if (!isValidUsername) return;

    fetchBackend(`/requests?id=${user.id}`, {
      body: { username },
    })
      .then((data) => {
        console.log("Success posting request: ", data);
      })
      .catch((err) => {
        console.log("Error posting request: ", err);
      });
  };

  return (
    <>
      <input
        type="text"
        placeholder="Enter username..."
        value={username}
        onChange={(e) => {
          setUsername(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            sendFriendRequest();
          }
        }}
      />
      <button onClick={sendFriendRequest}>Send request</button>
    </>
  );
}
