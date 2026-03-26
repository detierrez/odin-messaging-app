import TextBox from "./TextBox";
import Banner from "./Banner";
import s from "@styles/Chat.module.css";
import { useEffect, useRef } from "react";
import { useUser } from "../../../../../hooks";

export default function ChatWindow({ chat }) {
  const {
    user: { id: userId },
  } = useUser();
  const scrollable = useRef();
  useEffect(() => {
    scrollable.current.scrollTop = scrollable.current.scrollHeight;
  }, [chat]);
  return (
    <div className={s.chat}>
      <div className={s.banner}>
        <Banner />
      </div>
      <ul className={s.history} ref={scrollable}>
        {chat &&
          chat.map((m) => {
            const className =
              m.fromId === userId ? s.userMessage : s.friendMessage;
            return (
              <li className={className} key={m.id}>
                <b>{m.fromId}</b> - {m.id}
                <br />
                {m.text}
              </li>
            );
          })}
      </ul>
      <div className={s.textBox}>
        <TextBox />
      </div>
    </div>
  );
}
