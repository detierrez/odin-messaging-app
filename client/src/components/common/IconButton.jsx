import { merge } from "@lib/index";
import s from "./IconButton.module.css";

export default function IconButton({
  src,
  className,
  iconClass,
  variant,
  alt,
  ...props
}) {
  const isLoading = variant === "loading";

  return (
    <button
      type="button"
      className={merge(className, s.button, isLoading ? null : s[variant])}
      {...props}
    >
      {isLoading ? (
        <div className={merge(iconClass, s.img, s.loading)}></div>
      ) : (
        <img className={merge(iconClass, s.img)} src={src} alt={alt} />
      )}
    </button>
  );
}
