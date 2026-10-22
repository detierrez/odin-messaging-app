import { useOwnId, useUser } from "./useCache";

export function useSystemText(message) {
  const ownId = useOwnId();
  const { type, userId: actorUserId, metadata } = message;
  const { targetUserId, role, updatedFields } = metadata ?? {};
  const actorName = useUser(actorUserId).user?.name;
  const targetName = useUser(targetUserId).user?.name;

  const isUserActor = ownId === actorUserId;
  const isUserTarget = ownId === targetUserId;

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
