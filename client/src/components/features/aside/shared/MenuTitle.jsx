import { IconButton } from "@components/common";
import s from "./MenuTitle.module.css";

export default function MenuTitle({ src, alt = "", onClick, children }) {
  return (
    <div className={s.title}>
      <IconButton src={src} alt={alt} onClick={onClick} />
      <span>{children}</span>
    </div>
  );
}
