import { io } from "socket.io-client";
import { useEffect } from "react";
import { SERVER_BASE_URL } from "@lib/api";
import { useQueryClient } from "@tanstack/react-query";

export function SocketIo({ children }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = io(SERVER_BASE_URL, { withCredentials: true });
    socket.on("update_user", ({ user: { id: userId, ...newData } }) =>
      queryClient.setQueryData(["users", userId], (user) => ({
        ...user,
        ...newData,
      })),
    );

    // socket.on("add_request", ({ request }) =>
    //   cache.set("requests", (requests) => [...requests, request]),
    // );
    // socket.on("remove_request", ({ requestId }) =>
    //   cache.set("requests", (requests) =>
    //     requests.filter((r) => r.id !== requestId),
    //   ),
    // );
    // socket.on("add_friendship", ({ friendId }) =>
    //   cache.set("requests", (friends) => friends.add(friendId)),
    // );
    // socket.on("remove_friendship", ({ friendId }) =>
    //   cache.set("requests", (friends) => friends.remove(friendId)),
    // );
    // socket.on("update_group", ({ group: { id, ...newData } }) =>
    //   cache.set(`group:${id}`, (group) => ({ ...group, ...newData })),
    // );
    // socket.on("add_membership", ({ membership }) =>
    //   cache.set(`group:${membership.groupId}`, (group) => ({
    //     ...group,
    //     memberships: [...group.memberships, membership],
    //   })),
    // );
    // socket.on(
    //   "update_membership",
    //   ({ membership: { groupId, userId, ...newData } }) =>
    //     cache.set(`group:${groupId}`, (group) => ({
    //       ...group,
    //       memberships: group.memberships.map((m) =>
    //         m.userId === userId ? { ...m, ...newData } : m,
    //       ),
    //     })),
    // );
    // socket.on("remove_membership", ({ membership: { groupId, userId } }) =>
    //   cache.set(`group:${groupId}`, (group) => ({
    //     ...group,
    //     memberships: group.memberships.filter((m) => m.userId !== userId),
    //   })),
    // );

    socket.on("add_message", ({ message }) =>
      queryClient.setQueryData(
        ["chats", message.chatId, "messages"],
        (data) => {
          const [firstPage, ...rest] = data.pages;
          return {
            pages: [[message, ...firstPage], ...rest],
            pageParams: data.pageParams,
          };
        },
      ),
    );

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, []);

  return <>{children}</>;
}
