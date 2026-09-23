/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Config de Vite. La sección `test` la lee Vitest (npm run test / test:watch);
// Vite en sí la ignora. Nada de plugins extra: el proyecto no necesita más.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
