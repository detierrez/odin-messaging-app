import { merge } from "@lib/index";
import s from "./Loader.module.css";

export default function Loader({ className, isLoading, children }) {
  return isLoading ? (
    <span className={merge(className, s.loading)}>Transparent</span>
  ) : (
    children
  );
}
