import { useContact } from "../../hooks";

export default function Banner() {
  const { contactId } = useContact();
  return (
    <div className="banner">
      <h1>{contactId}</h1>
    </div>
  );
}
