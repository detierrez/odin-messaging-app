import { moreVertical } from "@lib/icons";
import { merge } from "@lib/index";
import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import IconButton from "./IconButton";
import Surface from "./Surface";
import s from "./Dropdown.module.css";

export default function Dropdown({ className, children }) {
  const [isDropped, setIsDropped] = useState(false);
  const buttonRef = useRef(null);
  const contentRef = useRef(null);

  useLayoutEffect(() => {
    if (isDropped) {
      // Calculate rendering position
      const button = buttonRef.current;
      const content = contentRef.current;
      const rect = button.getBoundingClientRect();
      const { bottom, left, right } = rect;
      const { scrollY, scrollX, innerWidth } = window;
      const { offsetWidth: contentWidth } = content;

      content.style.top = `${bottom + scrollY + 4}px`;

      const overflowX = left + contentWidth > innerWidth;
      content.style.left = `${scrollX + (overflowX ? right - contentWidth : left)}px`;

      // Event logic
      document.body.addEventListener("click", handleClick);

      return () => document.body.removeEventListener("click", handleClick);

      function handleClick({ target }) {
        if (!button.contains(target)) {
          setIsDropped(false);
        }
      }
    }
  }, [isDropped]);

  return (
    <>
      <IconButton
        variant="cancelPadding"
        className={merge(className, s.button)}
        src={moreVertical}
        alt="more"
        onClick={handleDropdownClick}
        ref={buttonRef}
      />
      {isDropped &&
        createPortal(
          <Surface className={s.content} ref={contentRef}>
            {children}
          </Surface>,
          document.body,
        )}
    </>
  );

  function handleDropdownClick() {
    setIsDropped((prev) => !prev);
  }
}
