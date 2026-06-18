import s from "./Slider.module.css";

export default function Slider({ className, state, setState, children }) {
  const isOpen = ["opened", "closing"].includes(state);

  const handleAnimationEnd = (e) => {
    if (e.target === e.currentTarget && state === "closing") {
      setState("closed");
    }
  };

  const handleBgClick = (e) => {
    if (e.target === e.currentTarget) {
      setState("closing");
    }
  };

  const closingClass = state === "closing" ? s.closing : null;
  const containerClass = [s.sliderContainer, closingClass]
    .filter(Boolean)
    .join(" ");
  const sliderClass = [s.slider, className, closingClass]
    .filter(Boolean)
    .join(" ");
  return (
    isOpen && (
      <div
        className={containerClass}
        onAnimationEnd={handleAnimationEnd}
        onClick={handleBgClick}
      >
        <div className={sliderClass}>{children}</div>
      </div>
    )
  );
}
