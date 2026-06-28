import { useChats } from "./useContext";

export default function useFriends() {
  const { chats } = useChats();

  return Object.values(chats)
    .filter((chat) => chat.type === "DIRECT" && chat.isActive)
    .map(({ id, otherUserId }) => ({ chatId: id, friendId: otherUserId }));
}
