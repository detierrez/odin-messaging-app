import { useReducer } from "react";

export default function useRerender() {
  const [, rerender] = useReducer(() => ({}), {});
  return rerender;
}
