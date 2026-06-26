import { useEffect, useState } from "react";
import { HeadingLevelProvider } from "@providers";
import { useCurrentChat } from "@hooks";
import { Collapsible } from "@components/common";
import s from "./View.module.css";
import Banner from "./Banner";
import TextBox from "./TextBox";
import History from "./History";
import Details from "./slider/Details";

export default function View({ className }) {
  const { id: chatId } = useCurrentChat().chat || {};
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const rafId = window.requestAnimationFrame(() => setIsOpen(false));
    return () => window.cancelAnimationFrame(rafId);
  }, [chatId]);

  return (
    <Collapsible
      className={className}
      isOpen={isOpen}
      expandedContent={
        <Details className={s.details} onCloseClick={() => setIsOpen(false)} />
      }
      key={chatId}
    >
      {chatId && (
        <div className={s.view}>
          <HeadingLevelProvider>
            <Banner
              className={s.banner}
              onInfoClick={() => setIsOpen((t) => !t)}
            />
            <History className={s.history} />
            <TextBox className={s.textBox} />
          </HeadingLevelProvider>
        </div>
      )}
    </Collapsible>
  );
}
