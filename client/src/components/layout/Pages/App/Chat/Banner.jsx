import { useActiveContact } from "../../../../../hooks";

export default function Banner() {
  const { activeContactId } = useActiveContact();

  return (
    <div className="banner">
      <h1>{activeContactId}</h1>
    </div>
  );
}
