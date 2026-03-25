import { useState } from "react";
import { fetchBackend } from "../../../../../router/actions-loaders";
import { useActiveContact, useUser } from "../../../../../hooks";

export default function TextBox() {
  const { activeContactId } = useActiveContact();
  const { user } = useUser();
  const [drafts, setDrafts] = useState({});

  const text = drafts[activeContactId] || "";

  const updateActiveDraft = (text) => {
    setDrafts((prev) => ({ ...prev, [activeContactId]: text }));
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
            fetchBackend(
              `/contacts/${activeContactId}/messages?id=${user.id}`,
              {
                body: { text },
              },
            )
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
