import { useLayoutEffect, useRef } from "react";
import { differenceInDays, differenceInYears, format } from "date-fns";
import { merge } from "@lib/index";
import {
  useSelectedChat,
  useMessages,
  useOwnId,
  useSystemText,
  useUser,
} from "@hooks";
import s from "./History.module.css";
import { Loading } from "@components/common";

export default function History({ className }) {
  const { selectedChat } = useSelectedChat();
  const {
    messages = [],
    fetchNextPage,
    isFetching,
  } = useMessages(selectedChat);

  const scrollableRef = useRef(null);
  const snapshotHeight = useRef(0);

  useLayoutEffect(() => {
    const scrollable = scrollableRef.current;
    if (!scrollable) return;

    const { scrollHeight, scrollTop, clientHeight } = scrollable;
    const delta = scrollHeight - snapshotHeight.current;

    if (scrollHeight === clientHeight && !isFetching) {
      fetchNextPage(); // if no scrollbar, try to fetch
    }

    if (snapshotHeight.current - (scrollTop + clientHeight) <= 1) {
      scrollable.scrollTop = scrollHeight; // stay pinned to bottom
    } else if (delta > 0) {
      scrollable.scrollTop = scrollTop + delta; // keep anchored when history is prepended
    }

    snapshotHeight.current = scrollHeight;
  }, [messages]);

  return (
    <ul
      className={merge(className, s.history)}
      ref={scrollableRef}
      onScroll={handleScroll}
    >
      <MessagesStrip messages={messages} />
    </ul>
  );

  function handleScroll() {
    if (scrollableRef.current.scrollTop <= 250 && !isFetching) {
      fetchNextPage();
    }
  }
}

function MessagesStrip({ messages }) {
  return messages.map((message, i) => {
    const { type, userId: authorId } = message;
    const previous = messages[i - 1];
    const next = messages[i + 1];

    return type === "USER_MESSAGE" ? (
      <UserMessage
        {...{
          ...message,
          isContinuation:
            previous?.type === "USER_MESSAGE" && previous?.userId === authorId,
          hasContinuation:
            next?.type === "USER_MESSAGE" && next?.userId === authorId,
        }}
        key={message.id}
      />
    ) : (
      <SystemMessage {...message} key={message.id} />
    );
  });
}

function UserMessage({
  userId: authorId,
  attachmentUrl,
  content,
  sentAt,
  isContinuation,
  hasContinuation,
}) {
  const ownId = useOwnId();

  return (
    <li
      className={merge(
        s.message,
        ownId === authorId ? s.ownMessage : null,
        isContinuation ? s.continuation : null,
      )}
    >
      {!hasContinuation && <Avatar className={s.avatar} userId={authorId} />}
      <div className={s.messageBox}>
        {attachmentUrl && (
          <img className={s.attachment} src={attachmentUrl} alt="" />
        )}
        <pre className={s.content}>{content}</pre>
        <div className={s.date}>{formatTime(sentAt)}</div>
      </div>
    </li>
  );
}

function SystemMessage(message) {
  const text = useSystemText(message);
  return <li className={s.systemMessage}>{text}</li>;
}

function Avatar({ userId, ...props }) {
  const { user, isLoading } = useUser(userId, { waitAvatar: true });

  return isLoading ? (
    <Loading {...props} />
  ) : (
    <img src={user.avatarUrl} alt="" {...props} />
  );
}

function formatTime(date) {
  return differenceInDays(new Date(), date) <= 1
    ? format(date, "H:mm")
    : differenceInYears(new Date(), date) <= 1
      ? format(date, "H:mm d-MM")
      : format(date, "H:mm d-MM-Y");
}
