import { filter } from "@lib/icons";
import { merge } from "@lib/index";
import { useInbox } from "@hooks";
import { Dropdown, Heading, IconButton } from "@components/common";
import InboxEntry from "./InboxEntry";
import s from "./InboxMenu.module.css";

export default function InboxMenu({
  className,
  onAddFriendClick,
  onAddGroupClick,
  ...props
}) {
  const inbox = useInbox();

  return (
    <div className={merge(className, s.menu)} {...{ ...props }}>
      <div className={s.flex}>
        <Heading className={s.title}>Odinbox</Heading>
        <Dropdown className={s.button}>
          <button onClick={onAddFriendClick}>Add friends</button>
          <button onClick={onAddGroupClick}>New group</button>
        </Dropdown>
      </div>
      <div className={s.flex}>
        <input
          className={s.input}
          placeholder="Search for a chat"
          type="text"
        />
        <IconButton className={s.button} src={filter} alt="filter" />
      </div>
      <div className={s.list}>
        {inbox?.map(({ chatId, lastMessage }) => (
          <InboxEntry {...{ chatId, lastMessage }} key={chatId} />
        ))}
        {inbox?.map(({ chatId, lastMessage }) => (
          <InboxEntry {...{ chatId, lastMessage }} key={chatId} />
        ))}
      </div>
    </div>
  );
}
