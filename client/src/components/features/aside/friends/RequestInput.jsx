import { useState } from "react";
import s from "./RequestInput.module.css";
import { useMutation } from "@tanstack/react-query";
import { api } from "@lib/api";

export default function RequestInput() {
  const [username, setUsername] = useState("");
  const isValidUsername = !!username.trim();
  const mutation = useMutation({
    mutationFn: () => api.sendRequest(username),
  });

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
      mutation.mutate();
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
