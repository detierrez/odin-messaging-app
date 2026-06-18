import { useContext } from "react";
import { ElevationContext } from "@contexts";
import s from "./Surface.module.css";
import { merge } from "@lib/index";

const elevations = [
  "dp00",
  "dp01",
  "dp02",
  "dp03",
  "dp04",
  "dp06",
  "dp08",
  "dp12",
  "dp16",
  "dp24",
];

export default function Surface({
  className,
  level: propsLevel,
  children,
  ...props
}) {
  const contextLevel = useContext(ElevationContext) ?? 0;
  const level = Math.min(7, propsLevel ?? contextLevel ?? 0);

  return (
    <div
      className={merge(className, s.surface, s[elevations[level]])}
      {...{ ...props }}
    >
      <ElevationContext value={level + 1}>{children}</ElevationContext>
    </div>
  );
}
