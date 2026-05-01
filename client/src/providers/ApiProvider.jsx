import { ApiContext } from "@contexts/index";
import { useId } from "@hooks/index";
import { fetchBackend, SERVER_BASE_URL } from "@lib/client-api";
import { useCallback } from "react";

export default function ApiProvider({ children }) {
  const { id } = useId();

  const fetchApi = useCallback(
    async (path, options) => {
      const separator = path.includes("?") ? "&" : "?";
      return await fetchBackend(`${path}${separator}id=${id}`, options);
    },
    [id],
  );

  return (
    <ApiContext value={{ SERVER_BASE_URL, fetchApi }}>{children}</ApiContext>
  );
}
