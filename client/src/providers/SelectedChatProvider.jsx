import { useState } from "react";
import { SelectedChatContext } from "@contexts";

export function SelectedChatProvider({ children }) {
  const [selectedChat, setSelectedChat] = useState(2);
  return (
    <SelectedChatContext value={{ selectedChat, setSelectedChat }}>
      {children}
    </SelectedChatContext>
  );
}
