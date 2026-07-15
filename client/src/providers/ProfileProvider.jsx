import { ProfileContext } from "@contexts";
import { useState } from "react";

export default function UsersProvider({ children }) {
  const [profile, setProfile] = useState({});

  return (
    <ProfileContext value={{ profile, setProfile }}>{children}</ProfileContext>
  );
}
