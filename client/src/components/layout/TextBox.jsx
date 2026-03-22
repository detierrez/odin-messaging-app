import { useState } from "react";
import { fetchBackend } from "../../router/actions-loaders";

export default function TextBox({ action }) {
  const [text, setText] = useState("");

  return (
    <input
      type="text"
      name="text"
      id="text"
      value={text}
      onChange={(e) => setText(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          console.log("Enter!");
          fetchBackend(action, {
            body: { text },
          })
            .then((data) => {
              console.log(data);
            })
            .catch((err) => {
              console.log(err);
            });
          setText("");
        }
      }}
    />
  );
}
