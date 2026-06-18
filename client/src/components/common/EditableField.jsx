import { cross, pen } from "@lib/icons";
import { IconButton } from "@components/common";
import { useRef, useState } from "react";
import { merge } from "@lib/index";
import s from "./EditableField.module.css";

export default function EditableField({
  className,
  initialValue,
  placeholder,
  isEditable = true,
  onSubmit,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef(null);

  return (
    <div className={merge(className, s.field)}>
      {isEditable && <div className={s.button}></div>}
      <textarea
        className={merge(s.textarea, isEditing ? s.editing : null)}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        ref={inputRef}
        disabled={!isEditable}
      />
      {isEditable && (
        <IconButton
          className={s.button}
          src={isEditing ? cross : pen}
          alt="edit"
          onClick={handleClick}
          disabled={isSubmitting}
        />
      )}
    </div>
  );

  function cancelEdit() {
    inputRef.current.blur();
    setIsEditing(false);
    setValue(initialValue);
  }

  function handleClick() {
    if (isEditing) {
      cancelEdit();
    } else {
      inputRef.current.focus();
    }
  }

  function handleFocus() {
    setIsEditing(true);
  }

  function handleChange(e) {
    if (isSubmitting) return;
    setValue(e.target.value);
  }

  async function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();

      if (isSubmitting) return;
      try {
        setIsSubmitting(true);
        await onSubmit(value);
        setIsEditing(false);
        inputRef.current.blur();
      } finally {
        setIsSubmitting(false);
      }
    } else if (e.key === "Escape") {
      cancelEdit();
    }
  }
}
