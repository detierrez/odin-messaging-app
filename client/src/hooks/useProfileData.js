import { ERROR_AVATAR } from "@lib/images";
import { useChats } from "./useContext";
import useUser from "./useUser";
import { useReducer } from "react";

export default function useProfileData({ chatId, userId, groupId }) {
  const [, rerender] = useReducer(() => ({}), {});

  const chat = useChats().chats[chatId];
  const [user, isUserLoading, error] = useUser(userId || chat?.otherUserId);

  if (!chatId && !userId) {
    return { isLoading: false, data: null };
  }

  const isUserData = userId || chat?.type === "DIRECT";

  if (isUserData && isUserLoading) {
    return { isLoading: true, data: {} };
  }

  const avatarUrl = isUserData
    ? error
      ? ERROR_AVATAR
      : user.avatarUrl
    : chat.avatarUrl;

  const img = new Image();
  img.src = avatarUrl;

  if (avatarUrl && !img.complete) {
    img.onload = rerender;
    return { isLoading: true, data: {} };
  }

  const name = isUserData
    ? error
      ? "Error"
      : (user.alias ?? user.username)
    : chat.name;

  const username = isUserData ? user.username : null;

  const description = isUserData
    ? error
      ? "Error"
      : user.description
    : chat.description;

  return { isLoading: false, data: { username, name, avatarUrl, description } };
}
