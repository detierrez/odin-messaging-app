import s from "./IconButton.module.css";

export default function IconButton({
  src,
  className: propClass,
  alt = "",
  ...props
}) {
  const className = [propClass, s.button].filter(Boolean).join(" ");

  return (
    <button className={className} {...{ ...props }}>
      <img className={s.img} src={src} alt={alt} />
    </button>
  );
}
