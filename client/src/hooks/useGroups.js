import { useChats } from "./useContext";

export default function useGroups() {
  const { chats } = useChats();

  const groups = !chats
    ? null
    : Object.values(chats)
        .filter((chat) => chat.type === "GROUP" && chat.isActive)
        .map(({ id, name, avatarUrl }) => {
          return {
            chatId: id,
            name,
            avatarUrl,
          };
        })
        .sort((a, b) => a.name?.localeCompare(b.name));

  return groups;
}
