import { merge } from "@lib/index";
import s from "./ClickableImage.module.css";

export default function ClickableImage({
  className,
  text = "Click here",
  src,
  ...props
}) {
  return (
    <div
      className={merge(className, s.button)}
      ref={(button) => {
        if (button) {
          button.style.setProperty("--img-url", `url(${src})`);
        }
      }}
      {...{ ...props }}
    >
      <div>{text}</div>
    </div>
  );
}
