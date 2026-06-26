import { useState } from "react";
import { useApi } from "@hooks";
import s from "./RequestInput.module.css";

export default function RequestInput() {
  const { sendRequest } = useApi();
  const [username, setUsername] = useState("");
  const isValidUsername = !!username.trim();

  return (
    <div className={s.container}>
      <input
        type="text"
        className={s.input}
        placeholder="Enter username"
        value={username}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      <button
        className={s.button}
        onClick={sendFriendRequest}
        disabled={!isValidUsername}
      >
        Send request
      </button>
    </div>
  );

  async function sendFriendRequest() {
    if (isValidUsername) {
      await sendRequest(username);
      setUsername("");
    }
  }

  function handleChange(e) {
    setUsername(e.target.value);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") sendFriendRequest();
  }
}
