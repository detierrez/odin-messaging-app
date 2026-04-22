import { ApiContext } from "@contexts/index";
import { useUser } from "@hooks/index";
import { fetchBackend, SERVER_BASE_URL } from "@lib/client-api";
import { useCallback } from "react";

export function ApiProvider({ children }) {
  const {
    user: { id: userId },
  } = useUser();

  const apiFetch = useCallback(
    (path, options) => {
      const separator = path.includes("?") ? "&" : "?";
      fetchBackend(`${path}${separator}id=${userId}`, options);
    },
    [userId],
  );

  return (
    <ApiContext value={{ SERVER_BASE_URL, apiFetch }}>{children}</ApiContext>
  );
}
