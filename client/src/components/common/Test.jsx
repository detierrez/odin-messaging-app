import { check, pen } from "@lib/icons";
import { IconButton } from "@components/common";
import { useEffect, useRef, useState } from "react";

export default function ControlLabel({
  className,
  defaultValue,
  disabled,
  onSubmit = () => Promise.resolve(),
  renderInput = () => {},
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  return (
    <>
      {renderInput(value, !isEditing, handleChange, handleKeyDown, inputRef)}
      {!disabled && (
        <IconButton
          variant="cancelPadding"
          className={className}
          src={isEditing ? check : pen}
          alt="edit"
          onClick={handleClick}
        />
      )}
    </>
  );

  async function submit() {
    await onSubmit(value);
    setIsEditing(false);
  }

  async function handleClick() {
    if (isEditing) {
      submit();
    } else {
      setIsEditing(true);
    }
  }

  function handleChange(e) {
    setValue(e.target.value);
  }

  async function handleKeyDown(e) {
    if (e.key === "Escape") {
      setValue(defaultValue);
      setIsEditing(false);
    } else if (e.target.tagName === "INPUT" && e.key === "Enter") {
      submit();
    }
  }
}
