import { useContext } from "react";
import {
  ApiContext,
  ProfileContext,
  ChatsContext,
  CurrentChatContext,
  RequestsContext,
  UsersContext,
  AppContext,
} from "@contexts";

const useApp = () => useContext(AppContext);
const useProfile = () => useContext(ProfileContext);
const useUsers = () => useContext(UsersContext);
const useRequests = () => useContext(RequestsContext);
const useChats = () => useContext(ChatsContext);
const useApi = () => useContext(ApiContext);
const useCurrentChat = () => useContext(CurrentChatContext);

export {
  useApp,
  useProfile,
  useCurrentChat,
  useApi,
  useUsers,
  useRequests,
  useChats,
};
