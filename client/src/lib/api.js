import { ApiError } from "./errors";

export const SERVER_BASE_URL = import.meta.env.VITE_SERVER_URL;

async function fetchBackend(path, { body, method, signal } = {}) {
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
    console.log(`${options.method} ${path} > ${status}`, {
      body: options.body,
      payload,
    });
  }

  if (status >= 400) {
    throw new ApiError(payload);
  }

  return payload;
}

export const api = {
  // ============ DEBUG ============

  async getUnauthenticated() {
    console.log("getUnauthenticated...");
    await fetchBackend("/unauthenticated");
    return "asd";
  },

  // ============ AUTH ============

  login(username, password, signal) {
    return fetchBackend("/login", {
      body: { username, password },
      signal,
    });
  },

  logout(signal) {
    return fetchBackend(`/logout`, { method: "POST", signal });
  },

  // ============ USERS ============

  async getOwnUserId(signal) {
    const { user } = await fetchBackend("/users/me", { signal });
    return user.id;
  },

  updateProfile({ alias, description: desc, file }, signal) {
    const formData = new FormData();
    (alias || alias === "") && formData.append("alias", alias);
    (desc || desc === "") && formData.append("description", desc);
    file && formData.append("avatar", file);

    console.log({ alias, desc, file });

    return fetchBackend(`/users/me`, {
      method: "PATCH",
      body: formData,
      signal,
    });
  },

  async getUser(userId, signal) {
    const { user } = await fetchBackend(`/users/${userId}`, { signal });
    return user;
  },

  // ============ REQUESTS AND FRIENDSHIPS ============

  getRequests(signal) {
    return fetchBackend(`/requests`, { signal });
  },

  sendRequest(username, signal) {
    return fetchBackend(`/requests`, { body: { username }, signal });
  },

  deleteRequest(userId, signal) {
    return fetchBackend(`/requests/${userId}`, { method: "DELETE", signal });
  },

  async getFriends(signal) {
    const { friendIds } = await fetchBackend(`/friends`, { signal });
    return friendIds;
  },

  acceptRequest(userId, signal) {
    return fetchBackend(`/friends/${userId}`, { method: "POST", signal });
  },

  removeFriend(friendId, signal) {
    return fetchBackend(`/friends/${friendId}`, { method: "DELETE", signal });
  },

  // ============ GROUPS ============

  async getGroup(groupId, signal) {
    const { group } = await fetchBackend(`/groups/${groupId}`, { signal });
    return group;
  },

  createGroup(name, description, memberIds, file, signal) {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("avatar", file);
    memberIds.forEach((id) => formData.append("memberIds", id));

    return fetchBackend(`/groups`, { body: formData, signal });
  },

  updateGroup(groupId, { name, description: desc, file }, signal) {
    const formData = new FormData();
    (name || name === "") && formData.append("name", name);
    (desc || desc === "") && formData.append("description", desc);
    file && formData.append("avatar", file);

    return fetchBackend(`/groups/${groupId}`, {
      method: "PATCH",
      body: formData,
      signal,
    });
  },

  leaveGroup(groupId, signal) {
    return fetchBackend(`/groups/${groupId}/members/me`, {
      method: "DELETE",
      signal,
    });
  },

  closeGroup(groupId, signal) {
    return fetchBackend(`/groups/${groupId}`, {
      body: { isActive: false },
      method: "PATCH",
      signal,
    });
  },

  // ============ MEMBERS ============

  addMember(groupId, memberId, signal) {
    return fetchBackend(`/groups/${groupId}/members`, {
      body: { memberId },
      signal,
    });
  },

  updateMember(groupId, memberId, role, signal) {
    return fetchBackend(`/groups/${groupId}/members/${memberId}`, {
      body: { role },
      method: "PATCH",
      signal,
    });
  },

  removeMember(groupId, memberId, signal) {
    return fetchBackend(`/groups/${groupId}/members/${memberId}`, {
      method: "DELETE",
      signal,
    });
  },

  // ============ CHATS ============

  async getInbox(signal) {
    const { chats } = await fetchBackend(`/chats`, { signal });
    return chats;
  },

  async loadMessages(chatId, cursor, limit = 10, signal) {
    const { messages } = await fetchBackend(
      `/chats/${chatId}/messages?limit=${limit}${cursor ? `&cursor=${cursor}` : ""}`,
      { signal },
    );
    return messages;
  },

  postMessage(chatId, content, attachment, signal) {
    const formData = new FormData();
    (content || content === "") && formData.append("content", content);
    attachment && formData.append("attachment", attachment);
    return fetchBackend(`/chats/${chatId}/messages`, {
      body: formData,
      signal,
    });
  },
};
