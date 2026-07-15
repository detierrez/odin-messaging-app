import useRerender from "./useRerender";

export default function useIsPreloaded(url) {
  const rerender = useRerender();
  const img = new Image();
  img.src = url;
  if (url && !img.complete) {
    img.onload = () => setTimeout(rerender, 1000);

    return false;
  }
  return true;
}
