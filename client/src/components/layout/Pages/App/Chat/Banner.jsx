import s from "@styles/Banner.module.css";
import { useData } from "../../../../../hooks";

export default function Banner() {
  const { chat } = useData();
  const { avatarUrl, name } = chat ?? {};

  return (
    <div className={s.banner}>
      <img src={avatarUrl} alt="" className={s.avatar} />
      <span>{name}</span>
    </div>
  );
}
