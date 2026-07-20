import js from "@eslint/js";
import astro from "eslint-plugin-astro";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [".astro/**", ".netlify/**", "dist/**", "node_modules/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  {
    files: ["src/**/*.{astro,ts}", "scripts/**/*.mjs", "*.{js,mjs}"],
    rules: {
      "no-undef": "off",
      "no-unused-vars": "off",
      "no-var": "off",
      "prefer-const": "off",
      "prefer-rest-params": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    files: ["src/**/*.astro"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      "no-undef": "error",
    },
  },
];
