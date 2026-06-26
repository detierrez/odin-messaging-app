import { merge } from "@lib/index";
import s from "./Input.module.css";
import { IconButton } from ".";
import { cross } from "@lib/icons";

export default function Input({
  className,
  icon,
  value,
  onCancelClick,
  ...props
}) {
  return (
    <div className={merge(className, s.container)}>
      {icon && <img className={s.icon} src={icon} alt="" />}
      <input type="text" className={s.input} value={value} {...props} />
      <IconButton
        variant="cancelPadding"
        className={merge(s.button, value && s.opaque)}
        src={cross}
        onClick={onCancelClick}
      />
    </div>
  );
}
