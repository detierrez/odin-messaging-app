import { useEffect } from "react";
import { useApi, useGroups } from "./useContext";
import { getGroup } from "@lib/api";

const awaitedGroups = new Set();

export default function useGroup(groupId) {
  const { fetchApi } = useApi();
  const { groups, setGroups } = useGroups();

  const cachedGroup = groups[groupId];

  useEffect(() => {
    if (groupId && !cachedGroup && !awaitedGroups.has(groupId)) {
      const controller = new AbortController();
      const { signal } = controller;
      const abortError = new Error("Abort Error");
      awaitedGroups.add(groupId);

      awaitFetch();

      return () => {
        controller.abort(abortError);
        awaitedGroups.delete(groupId);
      };

      async function awaitFetch() {
        try {
          const { group: fetchedGroup } = await getGroup(groupId, signal);
          setGroups((prev) => ({ ...prev, [groupId]: fetchedGroup }));
        } catch (error) {
          if (error !== abortError) {
            setGroups((prev) => ({ ...prev, [groupId]: error }));
          }
        }
      }
    }
  }, [cachedGroup, groupId, fetchApi, setGroups]);

  const group = cachedGroup ?? null;
  const isLoading = !!groupId && !cachedGroup;
  const error = cachedGroup instanceof Error ? cachedGroup : null;
  return [group, isLoading, error];
}
