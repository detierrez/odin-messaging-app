import { useChats, useCurrentChat, useRequests, useUsers } from "@hooks";
import StringifiedObject from "./StringifiedObject";

export default function Debugger() {
  const { users } = useUsers();
  const { chats } = useChats();
  const { requests } = useRequests();
  const { chat } = useCurrentChat();

  return (
    <div>
      <h6>Users</h6>
      <StringifiedObject object={users} />
      <h6>Current chat</h6>
      <StringifiedObject object={chat} />
      <h6>Requests</h6>
      <StringifiedObject object={requests} />
      <h6>Chats</h6>
      <StringifiedObject object={chats} />
    </div>
  );
}
