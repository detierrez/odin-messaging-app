import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@components": path.resolve(import.meta.dirname, "./src/components"),
      "@contexts": path.resolve(import.meta.dirname, "./src/contexts"),
      "@hooks": path.resolve(import.meta.dirname, "./src/hooks"),
      "@lib": path.resolve(import.meta.dirname, "./src/lib"),
      "@providers": path.resolve(import.meta.dirname, "./src/providers"),
      "@styles": path.resolve(import.meta.dirname, "./src/styles"),
      "@utils": path.resolve(import.meta.dirname, "./src/utils"),
    },
  },
});
