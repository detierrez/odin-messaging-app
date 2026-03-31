import s from "@styles/Banner.module.css";
import { useData } from "../../../../../hooks";

export default function Banner() {
  const { chat } = useData();
  const { id, avatarUrl } = chat ?? {};

  return (
    <div className="banner">
      <img src={avatarUrl} alt="" className={s.avatar} />
      <span>{id}</span>
    </div>
  );
}
