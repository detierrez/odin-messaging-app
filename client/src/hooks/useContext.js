import { useContext } from "react";
import * as contexts from "@contexts";

export const useSelectedChat = () => useContext(contexts.SelectedChatContext);
export const useCurrentChat = () => useContext(contexts.CurrentChatContext);
export const useElevation = () => useContext(contexts.ElevationContext);
