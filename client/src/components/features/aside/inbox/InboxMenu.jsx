import { cross, filter, search } from "@lib/icons";
import { merge } from "@lib/index";
import { Dropdown, IconButton, Input } from "@components/common";
import InboxEntry from "./InboxEntry";
import s from "./InboxMenu.module.css";
import { useState } from "react";
import { useSelectedChat, useChats } from "@hooks";

export default function InboxMenu({
  className,
  onAddFriendClick,
  onAddGroupClick,
  ...props
}) {
  const { setSelectedChat } = useSelectedChat();
  const { chats = {}, isLoading } = useChats();

  const [searchText, setSearchText] = useState("");
  if (isLoading) return <div>Loading</div>;
  return (
    <div className={merge(className, s.menu)} {...{ ...props }}>
      <div className={s.flex}>
        <h1 className={s.title}>Odinbox</h1>
        <Dropdown className={s.button}>
          <button onClick={onAddFriendClick}>Add friends</button>
          <button onClick={onAddGroupClick}>New group</button>
        </Dropdown>
      </div>

      <div className={s.flex}>
        <Input
          className={s.search}
          placeholder="Search for a chat"
          icon={search}
          value={searchText}
          buttonIcon={cross}
          onChange={handleSearchChange}
          onIconClick={handleClearSearch}
        />
        <IconButton
          variant="cancelPadding"
          className={s.filter}
          src={filter}
          alt="filter"
        />
      </div>
      <div className={s.list}>
        {Object.values(chats).map((chat) => (
          <InboxEntry
            {...{ chat, onClick: handleEntryClick(chat.id) }}
            key={chat.id}
          />
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

  function handleEntryClick(id) {
    return () => setSelectedChat(id);
  }
}
