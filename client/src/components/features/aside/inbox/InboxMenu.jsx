import { cross, filter, search } from "@lib/icons";
import { merge } from "@lib/index";
import { useApp } from "@hooks";
import { Dropdown, Heading, IconButton, Input } from "@components/common";
import InboxEntry from "./InboxEntry";
import s from "./InboxMenu.module.css";
import { useState } from "react";
import ProfileControls from "../profile/ProfileControls";

export default function InboxMenu({
  className,
  onAddFriendClick,
  onAddGroupClick,
  ...props
}) {
  const { chats, setSelectedChat } = useApp();
  const [searchText, setSearchText] = useState("");
  const inbox = chats.map((chat) => chat.messages.at(-1));

  return (
    <div className={merge(className, s.menu)} {...{ ...props }}>
      <ProfileControls n={1} />
      <ProfileControls n={2} />
      <ProfileControls n={3} />
      <ProfileControls n={4} />

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
        {inbox.map((message) => (
          <InboxEntry
            {...{ message, onClick: handleEntryClick(message.chatId) }}
            key={message.chatId}
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
