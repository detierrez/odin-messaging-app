import { useState } from "react";
import App from "./components/layout/Pages/App/App";
import { UserContext } from "./contexts/contexts";

export default function Controller() {
  const [user, setUser] = useState({ id: 1 });

  return (
    <UserContext value={{ user, setUser }}>
      <App key={user.id} />
    </UserContext>
  );
}
