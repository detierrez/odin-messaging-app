import { ApiError } from "./errors";

export const SERVER_BASE_URL = import.meta.env.VITE_SERVER_URL;

let _onUnauthenticated = null;
export function onUnauthenticated(handler) {
  _onUnauthenticated = handler;
}

export async function fetchBackend(path, { body, method, signal } = {}) {
  const options = {
    signal,
    credentials: "include",
    method: method ?? (body ? "POST" : "GET"),
    ...(!body
      ? {}
      : body instanceof FormData
        ? { body }
        : {
            headers: { ["Content-Type"]: "application/json" },
            body: JSON.stringify(body),
          }),
  };

  const response = await fetch(SERVER_BASE_URL + path, options);
  const { status } = response;
  const payload = await response.json();

  {
    // Debug
    console.log({
      req: { endpoint: `${method ?? (body ? "POST" : "GET")} ${path}`, body },
      res: { status, text: response.statusText, payload },
    });
  }

  if (status >= 400) {
    if (payload.errors[0].type === "UNAUTHENTICATED") {
      _onUnauthenticated?.();
    }
    throw new ApiError(payload);
  }

  return payload;
}

// ============ AUTH ============

export function login(username, password, signal) {
  return fetchBackend("/login", {
    body: { username, password },
    signal,
  });
}

export function logout(signal) {
  return fetchBackend(`/logout`, { method: "POST", signal });
}

// ============ USERS ============

export async function getProfile(signal) {
  const { user: profile } = await fetchBackend("/users/me", { signal });
  return profile;
}

export function updateProfile({ alias, description: desc, file }, signal) {
  const formData = new FormData();
  (alias || alias === "") && formData.append("alias", alias);
  (desc || desc === "") && formData.append("description", desc);
  file && formData.append("avatar", file);

  return fetchBackend(`/users/me`, { method: "PATCH", body: formData, signal });
}

export function getUser(userId, signal) {
  return fetchBackend(`/users/${userId}`, { signal });
}

// ============ REQUESTS AND FRIENDSHIPS ============

export function getRequests(signal) {
  return fetchBackend(`/requests`, { signal });
}

export function sendRequest(username, signal) {
  return fetchBackend(`/requests`, { body: { username }, signal });
}

export function deleteRequest(userId, signal) {
  return fetchBackend(`/requests/${userId}`, { method: "DELETE", signal });
}

export function getFriends(signal) {
  return fetchBackend(`/friends`, { signal });
}

export function acceptRequest(userId, signal) {
  return fetchBackend(`/friends/${userId}`, { method: "POST", signal });
}

export function removeFriend(friendId, signal) {
  return fetchBackend(`/friends/${friendId}`, { method: "DELETE", signal });
}

// ============ GROUPS ============

export function getGroup(groupId, signal) {
  return fetchBackend(`/groups/${groupId}`, { signal });
}

export function createGroup(name, description, memberIds, file, signal) {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("description", description);
  formData.append("avatar", file);
  memberIds.forEach((id) => formData.append("memberIds", id));

  return fetchBackend(`/chats`, { body: formData, signal });
}

export function updateGroup(chatId, { name, description: desc, file }, signal) {
  const formData = new FormData();
  (name || name === "") && formData.append("name", name);
  (desc || desc === "") && formData.append("description", desc);
  file && formData.append("avatar", file);

  return fetchBackend(`/chats/${chatId}`, {
    method: "PATCH",
    body: formData,
    signal,
  });
}

export function leaveGroup(chatId, signal) {
  return fetchBackend(`/chats/${chatId}/members/me`, {
    method: "DELETE",
    signal,
  });
}

export function closeGroup(chatId, signal) {
  return fetchBackend(`/chats/${chatId}`, {
    body: { isActive: false },
    method: "PATCH",
    signal,
  });
}

// ============ MEMBERS ============

export function addMember(chatId, memberId, signal) {
  return fetchBackend(`/chats/${chatId}/members`, {
    body: { memberId },
    signal,
  });
}

export function updateMember(chatId, memberId, role, signal) {
  return fetchBackend(`/chats/${chatId}/members/${memberId}`, {
    body: { role },
    method: "PATCH",
    signal,
  });
}

export function removeMember(chatId, memberId, signal) {
  return fetchBackend(`/chats/${chatId}/members/${memberId}`, {
    method: "DELETE",
    signal,
  });
}

// ============ CHATS ============

export function getInbox(signal) {
  return fetchBackend(`/chats`, { signal });
}

export function loadMessages(chatId, cursor, limit = 10, signal) {
  return fetchBackend(
    `/chats/${chatId}/messages?cursor=${cursor}&limit=${limit}`,
    { signal },
  );
}

export function postMessage(chatId, content, attachment, signal) {
  const formData = new FormData();
  (content || content === "") && formData.append("content", content);
  attachment && formData.append("attachment", attachment);
  return fetchBackend(`/chats/${chatId}/messages`, { body: formData, signal });
}
