import { useState } from "react";
import { ContactContext } from "../contexts/contexts";

export default function ContactProvider({ children }) {
  const [contactId, setContactId] = useState(5);

  return (
    <ContactContext value={{ contactId, setContactId }}>
      {children}
    </ContactContext>
  );
}
