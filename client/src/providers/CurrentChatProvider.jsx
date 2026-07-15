import { useState } from "react";
import { useChats, useProfile } from "@hooks";
import { CurrentChatContext } from "@contexts";

export default function CurrentChatProvider({ children }) {
  const userId = useProfile().id;
  const [currentChatId, setCurrentChatId] = useState(224);
  const { [currentChatId]: currentChat = {} } = useChats().chats;

  const { memberships, type, otherUserId, isActive } = currentChat;

  const isUserAdmin = isActive && memberships?.[userId] === "ADMIN";
  const isFriend = isActive && otherUserId;
  const isDirect = type === "DIRECT";

  return (
    <CurrentChatContext
      value={{
        chat: currentChat
          ? { ...currentChat, isFriend, isDirect, isUserAdmin }
          : null,
        setCurrentChat: setCurrentChatId,
      }}
    >
      {children}
    </CurrentChatContext>
  );
}
