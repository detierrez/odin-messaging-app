import { useState } from "react";
import App from "./components/layout/Pages/App/App";
import { ActiveContactContext, UserContext } from "./contexts/contexts";

export default function Controller() {
  const [user, setUser] = useState({ id: 1 });
  const [activeContactId, setActiveContactId] = useState(5);

  return (
    <UserContext value={{ user, setUser }}>
      <ActiveContactContext value={{ activeContactId, setActiveContactId }}>
        <App key={user.id} />
      </ActiveContactContext>
    </UserContext>
  );
}
