import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "modern-normalize";
import "./styles/reset.css";
import "./styles/global.css";
import "./styles/shared.css";
import "./styles/animations.css";
import AppRouterProvider from "./router";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppRouterProvider />
  </StrictMode>,
);
