import { useState } from "react";
import { fetchBackend } from "../../../../../router/actions-loaders";
import { useData, useUser } from "../../../../../hooks";

export default function TextBox() {
  const { chat } = useData();
  const { user } = useUser();
  const [drafts, setDrafts] = useState({});

  const text = drafts[chat.id] || "";

  const updateActiveDraft = (text) => {
    setDrafts((prev) => ({ ...prev, [chat.id]: text }));
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
            e.preventDefault(); // do not add new line
            fetchBackend(`/chats/${chat.id}?id=${user.id}`, {
              body: { text },
            })
              .then((data) => {
                console.log(`Success posting message: `, data);
              })
              .catch((err) => {
                console.log(`Error posting message: `, err);
              });
            updateActiveDraft("");
          }
        }
      }}
    />
  );
}
