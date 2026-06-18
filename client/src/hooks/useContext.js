import { useContext } from "react";
import {
  ApiContext,
  ChatsContext,
  CurrentChatContext,
  IdContext,
  RequestsContext,
  UsersContext,
} from "@contexts";

const useId = () => useContext(IdContext);
const useUsers = () => useContext(UsersContext);
const useRequests = () => useContext(RequestsContext);
const useChats = () => useContext(ChatsContext);
const useApi = () => useContext(ApiContext);
const useCurrentChat = () => useContext(CurrentChatContext);

export { useId, useCurrentChat, useApi, useUsers, useRequests, useChats };
