import s from "@styles/Chat.module.css";
import { useData, useId } from "@hooks";
import TextBox from "./TextBox";
import { useCallback, useLayoutEffect, useRef } from "react";
import Banner from "./Banner";
import { useApi, useUser } from "@hooks/index";
import { differenceInDays, differenceInYears, format } from "date-fns";

export default function ChatWindow() {
  const { fetchApi } = useApi();
  const { chat, dispatchChatHistories } = useData();
  const isFetching = useRef(false);
  const scrollableRef = useRef(null);
  const scrollSnapshot = useRef({
    snapshotHeight: 0,
    hasScrolledTop: false,
  });

  const fetchMessages = useCallback(() => {
    if (!chat || isFetching.current) return;

    const { id: chatId, messages } = chat;
    const oldestMessage = messages[0];
    const hasReachedBegin = !oldestMessage ? true : oldestMessage.isBegin;

    if (hasReachedBegin) return;

    isFetching.current = true;
    fetchApi(`/chats/${chatId}/messages?cursor=${oldestMessage.id}&limit=10`)
      .then(({ messages }) =>
        dispatchChatHistories({
          type: "add_messages",
          chatId,
          messages,
        }),
      )
      .catch((e) => console.log("Error loading messages", e))
      .finally(() => (isFetching.current = false));
  }, [chat, fetchApi, dispatchChatHistories]);

  useLayoutEffect(() => {
    const { current: scrollable } = scrollableRef;
    if (!scrollable) return;

    const { scrollHeight, scrollTop, clientHeight } = scrollable;
    const { snapshotHeight, hasScrolledTop } = scrollSnapshot.current;

    if (scrollHeight === clientHeight) fetchMessages();

    if (snapshotHeight - (scrollTop + clientHeight) <= 1) {
      // if was docked to bottom
      // theoretically 0, but use due to rounding effects
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
    <div className={s.chat}>
      {chat && (
        <>
          <div className={s.banner}>
            <Banner />
          </div>
          <ul className={s.history} ref={scrollableRef} onScroll={handleScroll}>
            <MessagesStrip messages={chat.messages} />
          </ul>
          <div className={s.textBox}>
            <TextBox />
          </div>
        </>
      )}
    </div>
  );
}

function MessagesStrip({ messages }) {
  const { id: userId } = useId();

  return messages.map(({ id, userId: authorId, sentAt, content }, index) => {
    const previousMessage = messages[index - 1];
    const nextMessage = messages[index + 1];
    const isContinuation = previousMessage?.userId === authorId;
    const hasContinuation = nextMessage?.userId === authorId;
    const className = `
    ${s.message}
    ${authorId === userId ? s.userMessage : ""}
    ${isContinuation ? s.continuation : ""}
    `;

    return (
      <li className={className} key={id}>
        {!hasContinuation && <Avatar className={s.avatar} userId={authorId} />}
        <pre className={s.content}>{content}</pre>
        <div className={s.date}>{formatTime(sentAt)}</div>
      </li>
    );
  });
}

function Avatar({ className, userId }) {
  const { avatarUrl } = useUser(userId);
  return <img className={className} src={avatarUrl} alt="" />;
}

function formatTime(date) {
  return differenceInDays(new Date(), date) <= 1
    ? format(date, "H:mm")
    : differenceInYears(new Date(), date) <= 1
      ? format(date, "H:mm d-MM")
      : format(date, "H:mm d-MM-Y");
}
