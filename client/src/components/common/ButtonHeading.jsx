import Heading from "./Heading";
import IconButton from "./IconButton";
import s from "./ButtonHeading.module.css";

export default function ButtonHeading({
  className: propsClass,
  title,
  src,
  alt,
  isButtonFirst = false,
  onClick,
  ...props
}) {
  const className = [propsClass, s.heading].filter(Boolean).join(" ");
  const button = (
    <IconButton className={s.button} src={src} alt={alt} onClick={onClick} />
  );
  return (
    <Heading className={className} {...{ ...props }}>
      {isButtonFirst ? [button, title] : [title, button]}
    </Heading>
  );
}
