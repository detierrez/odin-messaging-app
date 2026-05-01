import { useState } from "react";
import { useData } from "@hooks";
import { useApi } from "@hooks/index";

export default function TextBox() {
  const { chat } = useData();
  const [drafts, setDrafts] = useState({});
  const { fetchApi } = useApi();

  const chatId = chat?.id;
  const content = drafts[chatId] || "";

  const updateActiveDraft = (text) => {
    setDrafts((prev) => ({ ...prev, [chatId]: text }));
  };

  return (
    <textarea
      type="text"
      name="text"
      id="text"
      value={content}
      disabled={!chat || !chat.isActive}
      onChange={(e) => updateActiveDraft(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          if (!e.shiftKey) {
            e.preventDefault(); // do not add new line
            fetchApi(`/chats/${chatId}/messages`, { body: { content } })
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
