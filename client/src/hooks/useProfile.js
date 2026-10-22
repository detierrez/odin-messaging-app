import { useGroup, useOwnId, useUser } from "./useCache";

export function useChatProfile(chat, { waitAvatar = false } = {}) {
  const ownId = useOwnId();
  const { friendAId: aId, friendBId: bId, groupId } = chat;
  const groupQuery = useGroup(groupId, { waitAvatar });
  const userQuery = useUser(ownId === aId ? bId : aId, {
    waitAvatar,
  });

  const { group, user, ...restOfQuery } = groupId ? groupQuery : userQuery;

  return { profile: groupId ? group : user, ...restOfQuery };
}
