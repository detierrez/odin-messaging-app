import { useEffect, useRef, useState } from "react";
import { merge } from "@lib/index";
import s from "./Collapsible.module.css";

export default function Collapsible({
  className,
  isOpen,
  expandedContent,
  children,
}) {
  const [isRendered, setIsRendered] = useState(false);
  const containerRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const rafId = window.requestAnimationFrame(() => setIsRendered(true));

      return () => window.cancelAnimationFrame(rafId);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isRendered) {
      containerRef.current.style.setProperty(
        "--content-width",
        `${isOpen ? contentRef.current.getBoundingClientRect().width : 0}px`,
      );
    }
  }, [isRendered, isOpen]);

  return (
    <div
      className={merge(className, s.container)}
      onTransitionEnd={(e) => {
        if (e.target === e.currentTarget) {
          !isOpen && setIsRendered(false);
        }
      }}
      ref={containerRef}
    >
      {children}
      {isRendered && (
        <div className={s.collapsible} ref={contentRef}>
          {expandedContent}
        </div>
      )}
    </div>
  );
}
