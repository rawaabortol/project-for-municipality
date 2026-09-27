import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      // Forward API calls to the Express server during development
      "/api": {
        target: process.env.VITE_API_PROXY_TARGET || "http://localhost:5050",
        changeOrigin: true,
      },
    },
  },
});
