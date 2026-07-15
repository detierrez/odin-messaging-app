import { merge } from "@lib/index";
import s from "./Input.module.css";
import { IconButton } from ".";
import { useState } from "react";

export default function Input({
  className,
  icon,
  buttonIcon,
  onChange,
  onIconClick,
  ...props
}) {
  const [isButtonShown, setIsButtonShown] = useState(false);

  return (
    <div className={merge(className, s.container)}>
      {icon && <img className={s.icon} src={icon} alt="" />}
      <input
        type="text"
        className={s.input}
        onChange={handleChange}
        {...props}
      />
      {buttonIcon && (
        <IconButton
          variant="cancelPadding"
          className={merge(s.button, isButtonShown && s.visible)}
          src={buttonIcon}
          onClick={onIconClick}
        />
      )}
    </div>
  );

  function handleChange(e) {
    setIsButtonShown(!!e.target.value);
    onChange(e);
  }
}
