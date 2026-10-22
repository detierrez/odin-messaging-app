import { useReducer } from "react";

export function useRerender() {
  const [, rerender] = useReducer(() => ({}), {});
  return rerender;
}
