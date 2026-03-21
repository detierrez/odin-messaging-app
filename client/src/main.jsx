import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/reset.css";
import "./styles/base.css";
import AppRouterProvider from "./router";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppRouterProvider />
  </StrictMode>,
);
