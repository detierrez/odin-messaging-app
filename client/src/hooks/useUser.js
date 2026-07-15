import { useEffect } from "react";
import { useApi, useUsers } from "./useContext";
import { getUser } from "@lib/api";

const awaitedUsers = new Set();

export default function useUser(userId) {
  const { fetchApi } = useApi();
  const { users, setUsers } = useUsers();

  const cachedUser = users[userId];

  useEffect(() => {
    if (userId && !cachedUser && !awaitedUsers.has(userId)) {
      const controller = new AbortController();
      const { signal } = controller;
      const abortError = new Error("Abort Error");
      awaitedUsers.add(userId);

      awaitFetch();

      return () => {
        controller.abort(abortError);
        awaitedUsers.delete(userId);
      };

      async function awaitFetch() {
        try {
          const { user: fetchedUser } = await getUser(userId, signal);
          setUsers((prev) => ({ ...prev, [userId]: fetchedUser }));
        } catch (error) {
          if (error !== abortError) {
            setUsers((prev) => ({ ...prev, [userId]: error }));
          }
        }
      }
    }
  }, [cachedUser, userId, fetchApi, setUsers]);

  const user = cachedUser ?? null;
  const isLoading = !!userId && !cachedUser;
  const error = cachedUser instanceof Error ? cachedUser : null;
  return [user, isLoading, error];
}
