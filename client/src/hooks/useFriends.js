import { useChats } from "./useContext";

export default function useFriends() {
  const { chats } = useChats();

  const friends = !chats
    ? null
    : Object.values(chats)
        .filter((chat) => chat.type === "DIRECT" && chat.isActive)
        .map(({ id, otherUserId }) => {
          return {
            chatId: id,
            friendId: otherUserId,
          };
        });

  return friends;
}
