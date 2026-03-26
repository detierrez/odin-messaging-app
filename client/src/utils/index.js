export function getFriendId(userId, message) {
  const { fromId, toId } = message;
  return userId !== fromId ? fromId : toId;
}
