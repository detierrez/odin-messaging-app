import { merge } from "@lib/index";
import s from "./Loading.module.css";

export function Loading({ className }) {
  return <div className={merge(className, s.loading)}>Transparent</div>;
}
