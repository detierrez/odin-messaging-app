import { useChats } from "./useContext";

export default function useInbox() {
  const { chats } = useChats();

  return Object.values(chats)
    .map(({ id, messages }) => ({ chatId: id, ...messages.at(-1) }))
    .sort((a, b) => {
      return b.id - a.id;
    });
}
