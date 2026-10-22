import { useEffect } from "react";
import { queries } from "@lib/queries";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { isUnauthenticatedError } from "@lib/errors";
import { usePreloadUrl } from "./usePreloadUrl";

function renameData(name, query) {
  const { data, ...rest } = query;
  return { [name]: data, ...rest };
}

function useLoadAvatar(query, { isEnabled }) {
  const isLoadingAvatar = usePreloadUrl(isEnabled && query.data?.avatarUrl);
  return { ...query, isLoading: query.isLoading || isLoadingAvatar };
}

function useRedirectOnAuthError(error) {
  useEffect(() => {
    if (isUnauthenticatedError(error)) {
      window.location.replace("/logout");
    }
  }, [error]);
}

function useAuthedQuery(options) {
  const query = useQuery(options);
  useRedirectOnAuthError(query.error);
  return query;
}

function useAuthedInfiniteQuery(options) {
  const query = useInfiniteQuery(options);
  useRedirectOnAuthError(query.error);
  return query;
}

export function useOwnId() {
  const query = useAuthedQuery(queries.ownId());
  return renameData("ownId", query).ownId;
}

export function useUser(userId, { waitAvatar = false } = {}) {
  let query = useAuthedQuery(queries.user(userId));
  query = useLoadAvatar(query, { isEnabled: waitAvatar });
  return renameData("user", query);
}

export function useGroup(groupId, { waitAvatar = false } = {}) {
  let query = useAuthedQuery(queries.group(groupId));
  query = useLoadAvatar(query, { isEnabled: waitAvatar });
  return renameData("group", query);
}

export function useRequests() {
  const query = useAuthedQuery(queries.requests());
  return renameData("requests", query);
}

export function useFriends() {
  const query = useAuthedQuery(queries.friends());
  return renameData("friends", query);
}

export function useChats(isEnabled) {
  const query = useAuthedQuery(queries.chats(isEnabled));
  return renameData("chats", query);
}

export function useMessages(chatId) {
  const query = useAuthedInfiniteQuery(queries.messages(chatId));
  return renameData("messages", query);
}
