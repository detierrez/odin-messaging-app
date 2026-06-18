import { merge } from "@lib/index";
import s from "./Modal.module.css";

import { useRef, useEffect, useState } from "react";

export default function Modal({ isOpen, onClose, children }) {
  const dialogRef = useRef(null);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
      document.addEventListener("click", close);
      document.addEventListener("keydown", close);

      return () => {
        document.removeEventListener("keydown", close);
        document.removeEventListener("click", close);
      };
    } else {
      setIsClosing(false);
      dialog.close();
    }
  }, [isOpen]);

  return (
    <dialog
      className={merge(s.dialog, isClosing ? s.closing : null)}
      closedby="none"
      onAnimationEnd={handleAnimationEnd}
      ref={dialogRef}
    >
      {children}
    </dialog>
  );

  function close(event) {
    if (event.key === "Escape" || event.target !== dialogRef.current) {
      setIsClosing(true);
    }
  }

  function handleAnimationEnd() {
    if (isClosing) {
      onClose();
    }
  }
}
