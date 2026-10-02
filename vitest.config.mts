import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    // .test.tsx files opt into jsdom via a `// @vitest-environment jsdom` pragma.
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules/**", ".next/**", "lib/generated/**"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
});
