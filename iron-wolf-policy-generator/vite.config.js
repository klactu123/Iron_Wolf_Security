import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5175,
    proxy: {
      "/api": {
        target: "http://localhost:3003",
        changeOrigin: false,
        configure: (proxy) => {
          proxy.on("error", (err) => {
            console.error("Proxy error — is the backend running on port 3003?", err.message);
          });
        },
      },
    },
  },
});
