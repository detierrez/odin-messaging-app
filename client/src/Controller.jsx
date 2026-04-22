import { useState } from "react";
import App from "@components/App";
import { UserContext } from "@contexts";

export default function Controller() {
  const [user, setUser] = useState({ id: 1 });

  return (
    <UserContext value={{ user, setUser }}>
      <App key={user.id} />
    </UserContext>
  );
}
