import { useEffect, useMemo } from "react";
import { merge } from "@lib/index";
import s from "./SelectableImage.module.css";

export default function SelectableImage({
  className,
  text = "Add a picture",
  placeholder,
  isPlaceholderOverlaid = false,
  file,
  disabled,
  onChange,
}) {
  const previewUrl = useMemo(() => file && URL.createObjectURL(file), [file]);

  useEffect(
    () => () => previewUrl && URL.revokeObjectURL(previewUrl),
    [previewUrl],
  );

  return (
    <label
      className={merge(
        className,
        s.label,
        disabled ? s.disabled : null,
        !file && isPlaceholderOverlaid ? s.placeholderOverlaid : null,
      )}
      ref={(label) => {
        if (label) {
          label.style.setProperty(
            "--img-url",
            `url(${previewUrl ?? placeholder})`,
          );
        }
      }}
    >
      {!disabled && <div className={merge(s.text)}>{text}</div>}
      <input
        type="file"
        className={s.file}
        onChange={handleImageChange}
        accept="image/*"
        disabled={disabled}
      />
    </label>
  );

  async function handleImageChange(e) {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      await onChange(selectedFile);
    }
  }
}
