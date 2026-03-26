import { useState } from "react";
import App from "./components/layout/Pages/App/App";
import { ActiveFriendContext, UserContext } from "./contexts/contexts";

export default function Controller() {
  const [user, setUser] = useState({ id: 1 });
  const [activeFriend, setActiveFriend] = useState({ id: 5 });

  return (
    <UserContext value={{ user, setUser }}>
      <ActiveFriendContext value={{ activeFriend, setActiveFriend }}>
        <App key={user.id} />
      </ActiveFriendContext>
    </UserContext>
  );
}
