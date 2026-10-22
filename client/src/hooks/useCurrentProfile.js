import { useChats, useFriends, useOwnId } from "./useCache";
import { useSelectedChat } from "./useContext";
import { useChatProfile } from "./useProfile";

export function useCurrentProfile({ waitAvatar } = {}) {
  const ownId = useOwnId();
  const { selectedChat } = useSelectedChat();
  const {
    chats: { [selectedChat]: currentChat = {} } = {},
    isLoading: isLoadingChats,
  } = useChats();

  const profileQuery = useChatProfile(currentChat, {
    waitAvatar,
  });
  const { profile, isLoading: isLoadingProfile } = profileQuery;

  const { friends, isLoading: isLoadingFriends } = useFriends();

  const isGroup = !!currentChat.groupId;
  const role = profile?.participations?.find((p) => p.userId === ownId)?.role;
  const isActive = isGroup ? !!role : friends?.has(profile?.id);
  const isAdmin = role === "ADMIN";

  return {
    ...profileQuery,
    profile: { ...profile, isGroup, isActive, isAdmin },
    isLoading: isLoadingFriends || isLoadingChats || isLoadingProfile,
  };
}
