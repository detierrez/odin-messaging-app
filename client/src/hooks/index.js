import { useContext } from "react";

import { SetChatContext, DataContext, UserContext } from "../contexts/contexts";

export function useUser() {
  return useContext(UserContext);
}

export function useSetChat() {
  return useContext(SetChatContext);
}

export function useData() {
  return useContext(DataContext);
}
