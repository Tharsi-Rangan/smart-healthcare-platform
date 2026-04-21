import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "lottie-web": "lottie-web/build/player/lottie_light",
    },
  },
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return;
          }

          if (id.includes("react") || id.includes("react-dom") || id.includes("react-router-dom")) {
            return "vendor-react";
          }

          if (id.includes("framer-motion") || id.includes("lucide-react")) {
            return "vendor-ui";
          }

          if (id.includes("lottie-react") || id.includes("lottie-web")) {
            return "vendor-lottie";
          }

          const nodeModulesPath = id.split("node_modules/")[1];
          if (!nodeModulesPath) {
            return "vendor";
          }

          const packageName = nodeModulesPath.startsWith("@")
            ? nodeModulesPath.split("/").slice(0, 2).join("-")
            : nodeModulesPath.split("/")[0];

          return `vendor-${packageName.replace("@", "")}`;
        },
      },
    },
  },
});