import { filter, search } from "@lib/icons";
import { merge } from "@lib/index";
import { useInbox } from "@hooks";
import { Dropdown, Heading, IconButton, Input } from "@components/common";
import InboxEntry from "./InboxEntry";
import s from "./InboxMenu.module.css";
import { useState } from "react";

export default function InboxMenu({
  className,
  onAddFriendClick,
  onAddGroupClick,
  ...props
}) {
  const inbox = useInbox();
  const [searchText, setSearchText] = useState("");

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
        <Input
          className={s.search}
          icon={search}
          placeholder="Search for a chat"
          value={searchText}
          onChange={handleSearchChange}
          onCancelClick={handleClearSearch}
        />
        <IconButton
          variant="cancelPadding"
          className={s.filter}
          src={filter}
          alt="filter"
        />
      </div>
      <div className={s.list}>
        {inbox?.map(({ chatId, lastMessage }) => (
          <InboxEntry {...{ chatId, lastMessage }} key={chatId} />
        ))}
      </div>
    </div>
  );

  function handleSearchChange(e) {
    setSearchText(e.target.value);
  }

  function handleClearSearch() {
    setSearchText("");
  }
}
