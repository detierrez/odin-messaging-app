import { useId } from "./useContext";
import useProfileData from "./useProfileData";

export default function useSystemMessage(message) {
  const { id: userId } = useId();
  const { type, userId: actorUserId, metadata } = message;
  const { targetUserId, role, updatedFields } = metadata ?? {};
  const actorName = useProfileData({ userId: actorUserId }).data?.name;
  const targetName = useProfileData({ userId: targetUserId }).data?.name;

  const isUserActor = userId === actorUserId;
  const isUserTarget = userId === targetUserId;

  switch (type) {
    case "OPEN":
      return targetUserId
        ? `${isUserActor ? "You" : actorName} accepted ${isUserTarget ? "your" : `${targetName}'s`} request.`
        : `${isUserActor ? "You" : actorName} started this chat.`;
    case "CLOSE":
      return targetUserId
        ? `${isUserActor ? "You" : actorName} unfriended ${isUserTarget ? "you" : targetName}.`
        : `${isUserActor ? "You" : actorName} closed this chat.`;
    case "JOIN":
      return targetUserId
        ? `${isUserActor ? "You" : actorName} added ${isUserTarget ? "you" : targetName}.`
        : `${isUserActor ? "You" : actorName} joined.`;
    case "LEAVE":
      return targetUserId
        ? `${isUserActor ? "You" : actorName} removed ${isUserTarget ? "you" : targetName}.`
        : `${isUserActor ? "You" : actorName} left.`;
    case "ROLE_UPDATE":
      return targetUserId
        ? `${isUserActor ? "You" : actorName} ${role === "ADMIN" ? "promoted" : "demoted"} ${isUserTarget ? "you" : targetName}.`
        : `${isUserActor ? "You were" : `${actorName} was`} ${role === "ADMIN" ? "promoted" : "demoted"}.`;
    case "PROFILE_UPDATE": {
      const { name, description, avatarUrl } = updatedFields;
      return `${isUserActor ? "You" : actorName} ${
        name
          ? `updated the name to "${name}"`
          : description
            ? "updated the description"
            : avatarUrl
              ? "updated the avatar"
              : null
      }.`;
    }
  }
}
