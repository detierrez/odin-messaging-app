import { useActiveContact, useUser } from "../../../../../hooks";
import s from "@styles/Contact.module.css";

export default function Contact({ id, fromId, toId, text }) {
  const { user } = useUser();
  const { setActiveContactId } = useActiveContact();
  const contactId = user.id === fromId ? toId : fromId;
  return (
    <div className={s.contact} onClick={() => setActiveContactId(contactId)}>
      <div className={s.top}>
        <span className={s.contactName}>{contactId}</span>{" "}
        <span className={s.date}>{id}</span>
      </div>
      <div className={s.bot}>
        <span className={s.prepend}>{fromId === user.id ? "You: " : ""}</span>
        {text}
      </div>
    </div>
  );
}
