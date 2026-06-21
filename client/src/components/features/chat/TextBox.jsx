import { useEffect, useMemo, useRef, useState } from "react";
import { attach, cross, send } from "@lib/icons";
import { merge } from "@lib/index";
import { useApi, useCurrentChat } from "@hooks";
import { IconButton } from "@components/common";
import s from "./TextBox.module.css";

export default function TextBox({ className }) {
  const { postMessage } = useApi();
  const { id: chatId, isActive } = useCurrentChat().chat;
  const [drafts, setDrafts] = useState({});
  const [attachment, setAttachment] = useState(null);
  const attachmentRef = useRef(null);
  const textareaRef = useRef(null);

  const content = drafts[chatId] || "";

  const previewUrl = useMemo(
    () => attachment && URL.createObjectURL(attachment),
    [attachment],
  );

  useEffect(
    () => () => previewUrl && URL.revokeObjectURL(previewUrl),
    [previewUrl],
  );

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  if (!isActive) return;

  return (
    <div className={merge(className, s.box)}>
      {attachment && (
        <div className={s.topRow}>
          <div className={s.previewContainer}>
            <img className={s.preview} src={previewUrl} alt="attached file" />
            <IconButton
              className={s.removeAttachment}
              src={cross}
              alt="remove attachment"
              onClick={handleRemoveAttachment}
            />
          </div>
        </div>
      )}
      <div className={s.botRow}>
        <label className={s.attachment} htmlFor="attachment">
          <img className={`${s.attachmentIcon}`} src={attach} alt="attach" />
          <input
            type="file"
            accept="image/*"
            id="attachment"
            className={s.attachmentInput}
            onChange={handleAttachmentChange}
            ref={attachmentRef}
          />
        </label>
        <textarea
          className={s.input}
          type="text"
          name="text"
          id="text"
          rows={1}
          placeholder={"Write a message"}
          value={content}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          ref={textareaRef}
        />
        <IconButton
          className={merge(s.send, s.active)}
          src={send}
          alt="send"
          disabled={content.length === 0 && !attachment}
          onClick={handleSendClick}
        />
      </div>
    </div>
  );

  function handleKeyDown(e) {
    if (e.key !== "Enter" || e.shiftKey) return;

    e.preventDefault(); // do not add new line
    sendMessage();
  }

  function updateActiveDraft(text) {
    setDrafts((prev) => ({ ...prev, [chatId]: text }));
  }

  function handleInputChange(e) {
    updateActiveDraft(e.target.value);
  }

  function handleSendClick() {
    sendMessage();
  }

  function handleAttachmentChange(e) {
    const attachment = e.target.files[0];
    if (attachment) {
      setAttachment(attachment);
    }
  }

  function removeAttachment() {
    setAttachment(null);
    if (attachmentRef.current) {
      attachmentRef.current.value = "";
    }
  }

  function handleRemoveAttachment() {
    removeAttachment();
  }

  async function sendMessage() {
    if (content.length > 0 || attachment) {
      updateActiveDraft("");
      removeAttachment();
      await postMessage(chatId, content, attachment);
    }
  }
}
