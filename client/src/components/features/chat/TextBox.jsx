import s from "./TextBox.module.css";
import { useState } from "react";
import { attach, send } from "@lib/icons";
import { merge } from "@lib/index";
import { useApi, useCurrentChat } from "@hooks";
import { IconButton, Surface } from "@components/common";
import Modal from "@components/common/Modal";

export default function TextBox({ className }) {
  const { id: chatId, isActive } = useCurrentChat().chat;
  const [drafts, setDrafts] = useState({});
  const { postMessage } = useApi();

  const content = drafts[chatId] || "";

  const lineCount = (content.match(/\n/g) || []).length + 1;

  const updateActiveDraft = (text) => {
    setDrafts((prev) => ({ ...prev, [chatId]: text }));
  };

  if (!isActive) return;

  return (
    <div className={merge(className, s.box)}>
      <IconButton
        className={`${s.button}`}
        src={attach}
        alt="attach"
        onClick={handleAttachClick}
      />
      <textarea
        className={s.input}
        type="text"
        name="text"
        id="text"
        placeholder={"Write a message"}
        value={content}
        onChange={(e) => updateActiveDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={Math.min(7, lineCount)}
      />
      <IconButton
        className={merge(
          s.button,
          s.send,
          content.length > 0 ? s.active : null,
        )}
        src={send}
        alt="send"
        onClick={handleSendClick}
      />
    </div>
  );

  function handleKeyDown(e) {
    if (e.key !== "Enter" || e.shiftKey) return;

    e.preventDefault(); // do not add new line
    sendMessage();
  }

  function handleSendClick() {
    sendMessage();
  }

  function handleAttachClick() {}

  async function sendMessage() {
    if (content.length) {
      await postMessage(chatId, content);
      updateActiveDraft("");
    }
  }
}
