import { useCallback, useLayoutEffect, useRef } from "react";
import { differenceInDays, differenceInYears, format } from "date-fns";
import { merge } from "@lib/index";
import { useApi, useChats, useCurrentChat, useId } from "@hooks";
import { Avatar } from "@components/common";
import s from "./History.module.css";

export default function History({ className }) {
  const { loadMessages } = useApi();
  const { dispatchChats } = useChats();
  const { chat } = useCurrentChat();
  const isFetching = useRef(false);
  const scrollableRef = useRef(null);
  const scrollSnapshot = useRef({
    snapshotHeight: 0,
    hasScrolledTop: false,
  });

  const fetchMessages = useCallback(async () => {
    if (!chat || isFetching.current) return;

    const { id: chatId, messages } = chat;
    const oldestMessage = messages[0];
    const hasReachedBegin = !oldestMessage ? true : oldestMessage.isBegin;

    if (hasReachedBegin) return;

    try {
      isFetching.current = true;
      const { messages: newMessages } = await loadMessages(
        chatId,
        oldestMessage.id,
      );
      dispatchChats({
        type: "add_messages",
        chatId,
        messages: newMessages,
      });
    } catch (error) {
      console.log("Error loading messages", error);
    } finally {
      isFetching.current = false;
    }
  }, [chat, loadMessages, dispatchChats]);

  useLayoutEffect(() => {
    const { current: scrollable } = scrollableRef;
    if (!scrollable) return;

    const { scrollHeight, scrollTop, clientHeight } = scrollable;
    const { snapshotHeight, hasScrolledTop } = scrollSnapshot.current;

    if (scrollHeight === clientHeight) fetchMessages();

    if (snapshotHeight - (scrollTop + clientHeight) <= 1) {
      // if was docked to bottom
      // theoretically 0, but use 1 due to rounding effects
      scrollable.scrollTop = scrollHeight;
    }

    if (hasScrolledTop) {
      const reRenderGap = scrollHeight - snapshotHeight;
      scrollable.scrollTop = reRenderGap;
      scrollSnapshot.current.hasScrolledTop = false;
    }

    scrollSnapshot.current.snapshotHeight = scrollHeight;
  }, [fetchMessages]);

  const handleScroll = () => {
    if (scrollSnapshot.current.hasScrolledTop) return;

    const { clientHeight, scrollTop, scrollHeight } = scrollableRef.current;
    const isNearTop = scrollTop <= 200;
    const isAtBottom = scrollHeight - (scrollTop + clientHeight) <= 1;

    if (isNearTop && !isAtBottom) {
      scrollSnapshot.current.hasScrolledTop = true;
      fetchMessages();
    }
  };

  return (
    <ul
      className={merge(className, s.history)}
      ref={scrollableRef}
      onScroll={handleScroll}
    >
      <MessagesStrip messages={chat.messages} />
    </ul>
  );
}

function MessagesStrip({ messages }) {
  const { id: userId } = useId();

  return messages.map(({ id, userId: authorId, sentAt, content }, index) => {
    const previousMessage = messages[index - 1];
    const nextMessage = messages[index + 1];
    const isContinuation = previousMessage?.userId === authorId;
    const hasContinuation = nextMessage?.userId === authorId;

    return (
      <li
        className={merge(
          s.message,
          authorId === userId ? s.userMessage : null,
          isContinuation ? s.continuation : null,
        )}
        key={id}
      >
        {!hasContinuation && <Avatar className={s.avatar} userId={authorId} />}
        <pre className={s.content}>{content}</pre>
        <div className={s.date}>{formatTime(sentAt)}</div>
      </li>
    );
  });
}

function formatTime(date) {
  return differenceInDays(new Date(), date) <= 1
    ? format(date, "H:mm")
    : differenceInYears(new Date(), date) <= 1
      ? format(date, "H:mm d-MM")
      : format(date, "H:mm d-MM-Y");
}
