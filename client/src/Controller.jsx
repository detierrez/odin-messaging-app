import { useState } from "react";
import { IdContext } from "./contexts";
import App from "@components/App";

export default function Controller() {
  const [id, setId] = useState(3);

  return (
    <IdContext value={{ id, setId }}>
      <App key={id} />
    </IdContext>
  );
}
