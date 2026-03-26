import { useState } from "react";
import { fetchBackend } from "../../../../../router/actions-loaders";
import { useActiveFriend, useUser } from "../../../../../hooks";

export default function TextBox() {
  const {
    activeFriend: { id: friendId },
  } = useActiveFriend();
  const { user } = useUser();
  const [drafts, setDrafts] = useState({});

  const text = drafts[friendId] || "";

  const updateActiveDraft = (text) => {
    setDrafts((prev) => ({ ...prev, [friendId]: text }));
  };

  return (
    <textarea
      type="text"
      name="text"
      id="text"
      value={text}
      onChange={(e) => updateActiveDraft(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          if (!e.shiftKey) {
            e.preventDefault(); // Avoid adding new line
            fetchBackend(`/friends/${friendId}/messages?id=${user.id}`, {
              body: { text },
            })
              .then((data) => {
                console.log(data);
              })
              .catch((err) => {
                console.log(err);
              });
            updateActiveDraft("");
          }
        }
      }}
    />
  );
}
