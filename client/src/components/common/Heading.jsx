import { useContext } from "react";
import { HeadingLevelContext } from "@contexts";
import s from "./Heading.module.css";

export default function Heading({ className: propsClass, children, ...props }) {
  const level = useContext(HeadingLevelContext);

  const className = [propsClass, s.heading].filter(Boolean).join(" ");
  switch (level) {
    case 1:
      return <h1 {...{ className, ...props }}>{children}</h1>;
    case 2:
      return <h2 {...{ className, ...props }}>{children}</h2>;
    case 3:
      return <h3 {...{ className, ...props }}>{children}</h3>;
    case 4:
      return <h4 {...{ className, ...props }}>{children}</h4>;
    case 5:
      return <h5 {...{ className, ...props }}>{children}</h5>;
    default:
      return <h6 {...{ className, ...props }}>{children}</h6>;
  }
}
