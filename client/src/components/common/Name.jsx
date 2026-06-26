import { merge } from "@lib/index";
import { useProfileData } from "@hooks";
import s from "./Name.module.css";

export default function Name({ className, chatId, userId, ...props }) {
  const {
    isLoading,
    data: { name },
  } = useProfileData({ chatId, userId });

  return (
    <div
      className={merge(className, s.name, isLoading ? s.loading : null)}
      {...{ ...props }}
    >
      {!isLoading && (name || "New chat")}
    </div>
  );
}
