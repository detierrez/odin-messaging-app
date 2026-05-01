import { useData } from "@hooks/index";
import StringifiedObject from "./StringifiedObject";

export default function Debugger() {
  const { users, chat, requests, chatHistories } = useData();
  return (
    <div>
      <h6>Users</h6>
      <StringifiedObject object={users} />
      <h6>Current chat</h6>
      <StringifiedObject object={chat} />
      <h6>Requests</h6>
      <StringifiedObject object={requests} />
      <h6>ChatHistories</h6>
      <StringifiedObject object={chatHistories} />
    </div>
  );
}
