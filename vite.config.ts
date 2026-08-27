import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import fs from "fs";
//import react from '@vitejs/plugin-react';
import mkcert from 'vite-plugin-mkcert'

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), mkcert()],
  resolve: {
    tsconfigPaths: true,
  },
  optimizeDeps: {
    include: ["html5-qrcode"],
  },
  server: {
    host: true,
  },
});
