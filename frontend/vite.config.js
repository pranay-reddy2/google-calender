import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Fix for Google Sign-In and cross-origin issues
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      // Allow cross-origin communication (Google Sign-In uses postMessage)
      "Cross-Origin-Opener-Policy": "unsafe-none",
      "Cross-Origin-Embedder-Policy": "unsafe-none",

      // Optional: general CORS support for API calls
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  },
});
