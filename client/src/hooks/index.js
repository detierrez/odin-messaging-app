import { useEffect } from "react";
import { fetchBackend } from "../router/actions-loaders";

export function useBackend(path, set) {
  useEffect(() => {
    const controller = new AbortController();
    const abortError = new Error("Request aborted");
    fetchBackend(path, {
      signal: controller.signal,
    })
      .then((data) => {
        set(data);
      })
      .catch((error) => {
        if (error !== abortError) throw error;
      });
    return () => {
      controller.abort(abortError);
    };
  }, [path, set]);
}
