import { useEffect } from "react";
import useRerender from "./useRerender";
import cache from "@lib/cache";

export default function useCacheFetch(key, fetchFn) {
  const rerender = useRerender();

  useEffect(() => {
    if (!key || !cache.isEmpty(key)) return;

    return cache.fetch(key, fetchFn);
    // fetchFn is not expected to vary
    // eslint-disable-next-line
  }, [key]);

  useEffect(() => {
    if (!key) return;

    return cache.subscribe(key, rerender);
  }, [key, rerender]);

  const cachedData = cache.get(key);
  const data = cachedData ?? undefined;
  const isLoading = !!key && !cachedData;
  const error = cachedData instanceof Error ? cachedData : undefined;
  return [data, isLoading, error];
}
