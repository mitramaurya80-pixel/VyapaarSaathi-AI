import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-router-dom")) return "vendor-router";
            if (id.includes("react")) return "vendor-react";
            if (id.includes("recharts")) return "vendor-charts";
            return "vendor";
          }

          if (id.includes("src/pages/Dashboard")) return "page-dashboard";
          if (id.includes("src/pages/AISummaryPage")) return "page-ai-summary";
          if (id.includes("src/pages/InsightsPage")) return "page-insights";
          if (id.includes("src/pages/RecommendationsPage")) return "page-recommendations";
        },
      },
    },
  },
});