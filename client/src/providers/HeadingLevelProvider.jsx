import { HeadingLevelContext } from "@contexts";
import { useContext } from "react";

export default function HeadingLevelProvider({ level: propsLevel, children }) {
  const contextLevel = useContext(HeadingLevelContext);
  const level = propsLevel ?? contextLevel ?? 0;
  return (
    <HeadingLevelContext value={level + 1}>{children}</HeadingLevelContext>
  );
}
