import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,      // ← 원하는 포트
    strictPort: true // ← 이미 사용 중이면 다른 포트로 안 튐
  },
  build: {
    outDir: "build",
    emptyOutDir: true
  }
});

