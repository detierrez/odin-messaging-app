import { useContext, useEffect, useState } from "react";
import { fetchBackend } from "../router/actions-loaders";
import { ContactContext, WebSocketContext } from "../contexts/contexts";

export function useBackend(path) {
  const [data, setData] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    const abortError = new Error("Request aborted");
    fetchBackend(path, {
      signal: controller.signal,
    })
      .then((data) => {
        setData(data);
      })
      .catch((error) => {
        if (error !== abortError) throw error;
      });
    return () => {
      controller.abort(abortError);
    };
  }, [path]);

  return [data, setData];
}

export function useWebSocket() {
  return useContext(WebSocketContext);
}

export function useContact() {
  return useContext(ContactContext);
}
