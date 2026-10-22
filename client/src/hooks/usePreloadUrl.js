import { useRerender } from "./useRerender";

export function usePreloadUrl(url) {
  const rerender = useRerender();
  const img = new Image();
  img.src = url;
  if (url && !img.complete) {
    img.onload = () => setTimeout(rerender, 1000);

    return true;
  }
  return false;
}
