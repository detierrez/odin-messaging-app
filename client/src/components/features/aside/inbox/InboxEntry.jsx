import {
  useOwnId,
  useChatProfile,
  useSystemText,
  useTimeTag,
  useUser,
} from "@hooks";
import { merge } from "@lib/index";
import { Loading } from "@components/common";
import s from "./InboxEntry.module.css";

export default function InboxEntry({ chat, ...props }) {
  const { profile: { name, avatarUrl } = {}, isLoading } = useChatProfile(
    chat,
    { waitAvatar: true },
  );
  const message = chat.messages.at(-1);
  const { type, sentAt } = message;
  const timeTag = useTimeTag(sentAt);
  const isSystemMessage = type !== "USER_MESSAGE";

  return isLoading ? (
    <button className={s.entry} {...props}>
      <Loading className={s.avatar} />
      <Loading className={s.name} />
      <Loading className={s.date} />
      <Loading className={s.text} />
    </button>
  ) : (
    <button className={s.entry} {...props}>
      <img className={s.avatar} src={avatarUrl} />
      <div className={s.name}> {name}</div>
      <span className={s.date}>{timeTag}</span>
      <div className={merge(s.text)}>
        {isSystemMessage ? (
          <SystemText {...message} />
        ) : (
          <UserText {...message} />
        )}
      </div>
    </button>
  );
}

function UserText({ userId, content }) {
  const ownId = useOwnId();
  const authorName = useUser(userId).user?.name;

  return content ? (
    <>
      {userId === ownId && <span className={s.prepend}>You: </span>}
      {content}
    </>
  ) : (
    <span className={s.system}>
      {userId === ownId ? "You" : authorName} sent an attachment
    </span>
  );
}

function SystemText(message) {
  const text = useSystemText(message);
  return <span className={s.system}>{text}</span>;
}
