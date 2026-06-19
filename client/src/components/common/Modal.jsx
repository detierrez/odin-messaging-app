import { useRef, useEffect, useState } from "react";
import { merge } from "@lib/index";
import s from "./Modal.module.css";

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
        document.removeEventListener("click", close);
        document.removeEventListener("keydown", close);
      };

      function close({ type, key, target }) {
        if (
          (type === "keydown" && key === "Escape") ||
          (type === "click" && !dialog.contains(target))
        ) {
          onClose();
        }
      }
    } else if (dialog.open) {
      setIsClosing(true);
    }
  }, [isOpen, onClose]);

  return (
    <dialog
      className={merge(s.dialog, isClosing ? s.closing : null)}
      onAnimationEnd={handleAnimationEnd}
      ref={dialogRef}
    >
      {children}
    </dialog>
  );

  function handleAnimationEnd() {
    if (isClosing) {
      setIsClosing(false);
      dialogRef.current.close();
    }
  }
}
