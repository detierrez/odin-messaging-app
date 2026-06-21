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

  const updateProfile = useCallback(
    ({ alias, description: desc, file }) => {
      const formData = new FormData();
      (alias || alias === "") && formData.append("alias", alias);
      (desc || desc === "") && formData.append("description", desc);
      file && formData.append("avatar", file);

      return fetchApi(`/users/me`, { method: "PATCH", body: formData });
    },
    [fetchApi],
  );

  const createGroup = useCallback(
    (name, description, memberIds, file) => {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("avatar", file);
      memberIds.forEach((id) => formData.append("memberIds", id));

      return fetchApi(`/chats`, { body: formData });
    },
    [fetchApi],
  );

  const updateGroup = useCallback(
    (chatId, { name, description: desc, file }) => {
      const formData = new FormData();
      (name || name === "") && formData.append("name", name);
      (desc || desc === "") && formData.append("description", desc);
      file && formData.append("avatar", file);

      return fetchApi(`/chats/${chatId}`, { method: "PATCH", body: formData });
    },
    [fetchApi],
  );

  const leaveGroup = useCallback(
    (chatId) => fetchApi(`/chats/${chatId}/members/me`, { method: "DELETE" }),
    [fetchApi],
  );

  const closeGroup = useCallback(
    (chatId) =>
      fetchApi(`/chats/${chatId}`, {
        body: { isActive: false },
        method: "PATCH",
      }),
    [fetchApi],
  );

  const addMember = useCallback(
    (chatId, memberId) =>
      fetchApi(`/chats/${chatId}/members`, { body: { memberId } }),
    [fetchApi],
  );

  const updateMember = useCallback(
    (chatId, memberId, role) =>
      fetchApi(`/chats/${chatId}/members/${memberId}`, {
        body: { role },
        method: "PATCH",
      }),
    [fetchApi],
  );

  const removeMember = useCallback(
    (chatId, memberId) =>
      fetchApi(`/chats/${chatId}/members/${memberId}`, { method: "DELETE" }),
    [fetchApi],
  );

  const sendRequest = useCallback(
    (username) => fetchApi(`/requests`, { body: { username } }),
    [fetchApi],
  );

  const deleteRequest = useCallback(
    (userId) => fetchApi(`/requests/${userId}`, { method: "DELETE" }),
    [fetchApi],
  );

  const acceptRequest = useCallback(
    (userId) => fetchApi(`/friends/${userId}`, { method: "POST" }),
    [fetchApi],
  );

  const removeFriend = useCallback(
    (friendId) => fetchApi(`/friends/${friendId}`, { method: "DELETE" }),
    [fetchApi],
  );

  const loadMessages = useCallback(
    (chatId, cursor, limit = 10) =>
      fetchApi(`/chats/${chatId}/messages?cursor=${cursor}&limit=${limit}`),
    [fetchApi],
  );

  const postMessage = useCallback(
    (chatId, content, attachment) => {
      const formData = new FormData();
      (content || content === "") && formData.append("content", content);
      attachment && formData.append("attachment", attachment);
      return fetchApi(`/chats/${chatId}/messages`, { body: formData });
    },
    [fetchApi],
  );

  return (
    <ApiContext
      value={{
        fetchApi,
        updateProfile,
        createGroup,
        updateGroup,
        leaveGroup,
        closeGroup,
        addMember,
        updateMember,
        removeMember,
        sendRequest,
        deleteRequest,
        acceptRequest,
        removeFriend,
        loadMessages,
        postMessage,
      }}
    >
      {children}
    </ApiContext>
  );
}
