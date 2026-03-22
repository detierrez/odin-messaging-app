import { useState } from "react";
import { UserContext } from "../contexts/contexts";

export default function UserProvider({ children }) {
  const [user, setUser] = useState({ id: 1 });

  return <UserContext value={{ user, setUser }}>{children}</UserContext>;
}
