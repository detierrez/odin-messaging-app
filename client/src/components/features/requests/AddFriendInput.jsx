import s from "@styles/Requests.module.css";
import { useState } from "react";
import { useApi } from "@hooks";

export default function AddFriendInput() {
  const { fetchApi } = useApi();
  const [username, setUsername] = useState("");

  const isValidUsername = !!username.trim();

  const sendFriendRequest = () => {
    setUsername("");

    if (!isValidUsername) return;

    fetchApi(`/requests`, {
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
        className={s.usernameInput}
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
