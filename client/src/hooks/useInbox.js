import { useChats } from "./useContext";

export default function useInbox() {
  const { chats } = useChats();

  if (chats) {
    const inbox = Object.values(chats)
      .filter((chat) => chat.messages.length > 0)
      .map(({ id, type, otherUserId, name, avatarUrl, messages }) => {
        return {
          chatId: id,
          type,
          otherUserId,
          name,
          avatarUrl,
          lastMessage: messages.at(-1),
        };
      })
      .sort((a, b) => b.lastMessage.id - a.lastMessage.id);
    return inbox;
  }
  return null;
}
