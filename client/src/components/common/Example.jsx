export default function Example({ children, ...props }) {
  return <div {...{ ...props }}>{children}</div>;
}
