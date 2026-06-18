import { io } from "socket.io-client";
import { useEffect } from "react";
import { useChats, useId, useRequests, useUsers } from "./useContext";

export default function useSocketIo(SERVER_BASE_URL) {
  const { id } = useId();
  const { dispatchChats } = useChats();
  const { dispatchRequests } = useRequests();
  const { setUsers } = useUsers();

  useEffect(() => {
    const socket = io(SERVER_BASE_URL, {
      auth: { token: id },
    });

    socket.on("update_profile", ({ alias, description, avatarUrl }) =>
      setUsers((prev) => {
        const prevProfile = prev[id];
        return {
          ...prev,
          [id]: { ...prevProfile, alias, description, avatarUrl },
        };
      }),
    );

    const eventDispatchers = [
      { event: "add_request", dispatch: dispatchRequests },
      { event: "remove_request", dispatch: dispatchRequests },
      { event: "add_chat", dispatch: dispatchChats },
      { event: "update_chat", dispatch: dispatchChats },
      { event: "deactivate_chat", dispatch: dispatchChats },
      { event: "reactivate_chat", dispatch: dispatchChats },
      { event: "add_message", dispatch: dispatchChats },
      { event: "add_membership", dispatch: dispatchChats },
      { event: "update_membership", dispatch: dispatchChats },
      { event: "remove_membership", dispatch: dispatchChats },
    ];

    eventDispatchers.forEach(({ event, dispatch }) =>
      socket.on(event, (payload) => {
        dispatch({ ...payload, type: event });
      }),
    );

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [id, SERVER_BASE_URL, dispatchChats, dispatchRequests, setUsers]);
}
