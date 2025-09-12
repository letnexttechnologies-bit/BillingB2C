// frontend/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/BillingB2C/", // IMPORTANT for GitHub Pages and Netlify
});
