import { UsersContext } from "@contexts";
import { useState } from "react";

export default function UsersProvider({ children }) {
  const [users, setUsers] = useState({});

  return <UsersContext value={{ users, setUsers }}>{children}</UsersContext>;
}
