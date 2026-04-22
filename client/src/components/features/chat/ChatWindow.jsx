import s from "@styles/Chat.module.css";
import TextBox from "./TextBox";
import Banner from "./Banner";
import { useEffect, useRef } from "react";
import { useData, useUser } from "@hooks";

export default function ChatWindow() {
  const { chat } = useData();
  const {
    user: { id: userId },
  } = useUser();
  const scrollable = useRef();

  useEffect(() => {
    const { current } = scrollable;
    if (current) {
      current.scrollTop = current.scrollHeight;
    }
  }, [chat?.messages]);

  return (
    chat && (
      <div className={s.chat}>
        <div className={s.banner}>
          <Banner />
        </div>
        <ul className={s.history} ref={scrollable}>
          {chat.messages.map(({ id, userId: authorId, text }) => {
            return (
              <li
                className={
                  authorId === userId ? s.userMessage : s.friendMessage
                }
                key={id}
              >
                <b>{authorId}</b> - {id}
                <br />
                {text}
              </li>
            );
          })}
        </ul>
        <div className={s.textBox}>
          <TextBox />
        </div>
      </div>
    )
  );
}
