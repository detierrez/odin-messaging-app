import { merge } from "@lib/index";
import s from "./Menu.module.css";

export default function Menu({ className, children, ...props }) {
  return (
    <div className={merge(className, s.menu)} {...{ ...props }}>
      {children}
    </div>
  );
}
