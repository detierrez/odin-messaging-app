import { useEffect } from "react";
import { useApi, useUsers } from "./useContext";

const awaitedUsers = new Set();

export default function useUser(userId) {
  const { users, setUsers } = useUsers();
  const { fetchApi } = useApi();

  const user = users?.[userId];

  useEffect(() => {
    if (userId && !user && !awaitedUsers.has(userId)) {
      const controller = new AbortController();
      const { signal } = controller;
      const abortError = new Error("Abort Error");
      awaitedUsers.add(userId);

      awaitUser();

      return () => {
        controller.abort(abortError);
        awaitedUsers.delete(userId);
      };

      async function awaitUser() {
        try {
          const { user: fetchedUser } = await fetchApi(`/users/${userId}`, {
            signal,
          });
          setUsers((prev) => ({ ...prev, [userId]: fetchedUser }));
        } catch (error) {
          if (error !== abortError) {
            setUsers((prev) => ({ ...prev, [userId]: error }));
          }
        }
      }
    }
  }, [user, userId, fetchApi, setUsers]);

  const isLoading = !user;
  const error = user instanceof Error ? user : null;
  return [user, isLoading, error];
}
