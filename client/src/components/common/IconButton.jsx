import { merge } from "@lib/index";
import s from "./IconButton.module.css";
import { Loading } from ".";

export default function IconButton({
  src,
  className,
  iconClass,
  variant,
  alt,
  ...props
}) {
  const variants = variant ? variant.split(" ") : [];
  const isLoading = variants.includes("loading");

  return (
    <button
      type="button"
      className={merge(className, s.button, ...variants.map((v) => s[v]))}
      {...props}
    >
      {isLoading ? (
        <Loading className={merge(iconClass, s.img)} />
      ) : (
        <img className={merge(iconClass, s.img)} src={src} alt={alt} />
      )}
    </button>
  );
}
