import { useEffect } from "react";
import { useChats, useRequests, useUsers } from "./useContext";

export default function useInitialFetch(fetchApi) {
  const { setUsers } = useUsers();
  const { dispatchChats } = useChats();
  const { dispatchRequests } = useRequests();

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const abortError = new Error("Request aborted");

    awaitFetch();

    return () => {
      controller.abort(abortError);
    };

    async function awaitFetch() {
      try {
        const [{ chats }, { requests }] = await Promise.all([
          fetchApi(`/chats/inbox`, { signal }),
          fetchApi(`/requests`, { signal }),
        ]);
        dispatchChats({ type: "load", chats });
        dispatchRequests({ type: "load", requests });
      } catch (error) {
        if (error !== abortError) {
          throw error;
        }
      }
    }
  }, [fetchApi, setUsers, dispatchChats, dispatchRequests]);
}
