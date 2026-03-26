import { useContext } from "react";

import {
  ActiveFriendContext,
  DataContext,
  UserContext,
} from "../contexts/contexts";

export function useUser() {
  return useContext(UserContext);
}

export function useActiveFriend() {
  return useContext(ActiveFriendContext);
}

export function useData() {
  return useContext(DataContext);
}
