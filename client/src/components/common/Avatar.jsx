import { merge } from "@lib/index";
import { useProfileData } from "@hooks";
import s from "./Avatar.module.css";
import { DEFAULT_GROUP_AVATAR } from "@lib/images";
import { getUser } from "@lib/api";

function usePartyId(chatId) {
  const { profile, chats } = useApp();

  const { groupId, friendAId, friendBId } = chats[chatId];

  if (groupId) {
    return { groupId };
  }

  return { otherUserId: profile.id === friendAId ? friendBId : friendAId };
}

const awaitedResources = new Set();

export function useUser({ groupId, userId }) {
  const { users, setUsers, groups, setGroups } = useApp();

  const dataId = groupId && userId;
  const cache = groupId ? groups : users;
  const setCache = groupId ? setGroups : setUsers;
  const fetcher = groupId
    ? (signal) => getUser(groupId)
    : (signal) => getUser(userId);

  const cachedData = cache[dataId];

  useEffect(() => {
    if (dataId && !cachedData) {
      const controller = new AbortController();
      const { signal } = controller;
      const abortError = new Error("Abort Error");

      const cleanup = load();

      return () => {
        controller.abort(abortError);
      };

      async function load(signal, abortError) {
        try {
          const fetchedResource = await fetcher(signal);
          setCache((prev) => ({ ...prev, [dataId]: fetchedResource }));
        } catch (error) {
          if (error !== abortError) {
            setCache((prev) => ({ ...prev, [dataId]: error }));
          }
        }
      }
    }
  }, []);

  const data = cachedData ?? null;
  const isLoading = !!dataId && !cachedData;
  const error = cachedData instanceof Error ? cachedData : null;
  return [data, isLoading, error];
}

export default function Avatar({
  className,
  chatId,
  userId,
  groupId,
  ...props
}) {
  if (chatId) {
    return;
  }
}

export function ChatAvatar({ className, chatId, userId, groupId, ...props }) {
  if (chatId) {
    return;
  }
}

export function UserAvatar({ className, chatId, userId, groupId, ...props }) {
  if (chatId) {
    return;
  }
}

export function GroupAvatar({ className, chatId, userId, groupId, ...props }) {
  if (chatId) {
    return;
  }
}
