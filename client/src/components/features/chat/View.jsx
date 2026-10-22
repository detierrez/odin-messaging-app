import { useEffect, useState } from "react";
import { Collapsible } from "@components/common";
import s from "./View.module.css";
import Banner from "./Banner";
import { useSelectedChat } from "@hooks";
import Profile from "./slider/Profile";
import History from "./History";
import TextBox from "./TextBox";

export default function View({ className }) {
  const [isOpen, setIsOpen] = useState(false);
  const { selectedChat } = useSelectedChat();
  useEffect(() => {
    const rafId = window.requestAnimationFrame(() => setIsOpen(false));
    return () => window.cancelAnimationFrame(rafId);
  }, [selectedChat]);

  if (!selectedChat) return;

  return (
    <Collapsible
      className={className}
      isOpen={isOpen}
      expandedContent={
        <Profile className={s.details} onClose={handleCloseProfile} />
      }
      key={selectedChat}
    >
      {selectedChat && (
        <div className={s.view}>
          <Banner className={s.banner} onInfoClick={handleClickInfo} />
          <History className={s.history} />
          <TextBox className={s.textBox} />
        </div>
      )}
    </Collapsible>
  );

  function handleCloseProfile() {
    setIsOpen(false);
  }

  function handleClickInfo() {
    setIsOpen((t) => !t);
  }
}
