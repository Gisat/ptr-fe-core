import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
  {
    files: ["**/*.ts", "**/*.tsx"],
    ignores: ["**/node_modules/**", "**/dist/**", "vitest.config.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname, // bezpečnější než __dirname v ESM
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    extends: [
      "@typescript-eslint/recommended", 
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
]);