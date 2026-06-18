import { useCallback } from "react";
import { fetchBackend, SERVER_BASE_URL } from "@lib/client-api";
import { ApiContext } from "@contexts";
import { useId, useInitialFetch, useSocketIo } from "@hooks";

export default function ApiProvider({ children }) {
  const { id } = useId();

  const fetchApi = useCallback(
    (path, options) =>
      fetchBackend(`${path}${path.includes("?") ? "&" : "?"}id=${id}`, options),
    [id],
  );

  useSocketIo(SERVER_BASE_URL);
  useInitialFetch(fetchApi);

  return (
    <ApiContext
      value={{
        fetchApi,
        updateProfile: useCallback(
          async ({ alias, description: desc, file }) => {
            const formData = new FormData();
            (alias || alias === "") && formData.append("alias", alias);
            (desc || desc === "") && formData.append("description", desc);
            file && formData.append("avatar", file);

            return await fetchApi(`/users/me`, {
              method: "PATCH",
              body: formData,
            });
          },
          [fetchApi],
        ),

        createGroup: useCallback(
          async (name, description, memberIds, file) => {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("description", description);
            formData.append("avatar", file);
            memberIds.forEach((id) => formData.append("memberIds", id));

            return await fetchApi(`/chats`, { body: formData });
          },
          [fetchApi],
        ),
        updateGroup: useCallback(
          async (chatId, { name, description: desc, file }) => {
            const formData = new FormData();
            (name || name === "") && formData.append("name", name);
            (desc || desc === "") && formData.append("description", desc);
            file && formData.append("avatar", file);

            return await fetchApi(`/chats/${chatId}`, {
              method: "PATCH",
              body: formData,
            });
          },
          [fetchApi],
        ),
        leaveGroup: useCallback(
          (chatId) =>
            fetchApi(`/chats/${chatId}/members/me`, { method: "DELETE" })[
              fetchApi
            ],
          [fetchApi],
        ),
        closeGroup: useCallback(
          (chatId) =>
            fetchApi(`/chats/${chatId}`, {
              body: { isActive: false },
              method: "PATCH",
            }),
          [fetchApi],
        ),

        addMember: useCallback(
          (chatId, memberId) =>
            fetchApi(`/chats/${chatId}/members`, { body: { memberId } }),
          [fetchApi],
        ),
        updateMember: useCallback(
          (chatId, memberId, role) =>
            fetchApi(`/chats/${chatId}/members/${memberId}`, {
              body: { role },
              method: "PATCH",
            }),
          [fetchApi],
        ),
        removeMember: useCallback(
          (chatId, memberId) =>
            fetchApi(`/chats/${chatId}/members/${memberId}`, {
              method: "DELETE",
            }),
          [fetchApi],
        ),

        sendRequest: useCallback(
          (username) => fetchApi(`/requests`, { body: { username } }),
          [fetchApi],
        ),
        deleteRequest: useCallback(
          (userId) => fetchApi(`/requests/${userId}`, { method: "DELETE" }),
          [fetchApi],
        ),
        acceptRequest: useCallback(
          (userId) => fetchApi(`/friends/${userId}`, { method: "POST" }),
          [fetchApi],
        ),
        removeFriend: useCallback(
          (friendId) => fetchApi(`/friends/${friendId}`, { method: "DELETE" }),
          [fetchApi],
        ),

        loadMessages: useCallback(
          (chatId, cursor, limit = 10) =>
            fetchApi(
              `/chats/${chatId}/messages?cursor=${cursor}&limit=${limit}`,
            ),
          [fetchApi],
        ),
        postMessage: useCallback(
          (chatId, content) =>
            fetchApi(`/chats/${chatId}/messages`, { body: { content } }),
          [fetchApi],
        ),
      }}
    >
      {children}
    </ApiContext>
  );
}
