import {
  format,
  differenceInMinutes,
  differenceInHours,
  differenceInMilliseconds,
} from "date-fns";
import { useSetChat, useUser } from "@hooks";
import s from "@styles/InboxEntry.module.css";
import { useEffect, useReducer } from "react";
import { millisecondsInHour, millisecondsInMinute } from "date-fns/constants";
import { DEFAULT_AVATAR, DEFAULT_USERNAME } from "@lib/defaults";

export default function InboxEntry({ entry }) {
  const { chatId, otherUserId, name, avatarUrl, lastMessage } = entry;
  const { setActiveChatId } = useSetChat();
  const otherUser = useUser(otherUserId);
  const { sentAt } = lastMessage;

  const now = new Date();

  let tag;
  let delay;

  const diffInHours = differenceInHours(now, sentAt);
  const diffInMins = differenceInMinutes(now, sentAt);

  if (diffInHours >= 24) {
    delay = null;
    tag = format(sentAt, "MMM d");
  } else {
    const diffInMs = differenceInMilliseconds(now, sentAt);
    if (diffInHours >= 1) {
      delay = millisecondsInHour - (diffInMs % millisecondsInHour);
      tag = `${diffInHours} hour${diffInHours === 1 ? "" : "s"}`;
    } else {
      delay = millisecondsInMinute - (diffInMs % millisecondsInMinute);
      if (diffInMins >= 1) {
        tag = `${diffInMins} minute${diffInMins === 1 ? "" : "s"}`;
      } else {
        tag = "Now";
      }
    }
  }

  const [tick, forceUpdate] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    if (delay) {
      const ref = setTimeout(forceUpdate, delay);
      return () => clearTimeout(ref);
    }
  }, [delay, tick]);

  const handleEntryClick = () => {
    setActiveChatId(chatId);
  };

  return (
    <div className={s.entry} onClick={handleEntryClick}>
      <img
        src={avatarUrl ?? otherUser?.avatarUrl ?? DEFAULT_AVATAR}
        alt=""
        className={s.avatar}
      />
      <span className={s.name}>
        {name ?? otherUser?.username ?? DEFAULT_USERNAME}
      </span>
      <span className={s.date}>{tag}</span>
      <div className={s.content}>{lastMessage.content}</div>
    </div>
  );
}
