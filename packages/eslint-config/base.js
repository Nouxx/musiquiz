import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import json from "@eslint/json";
import markdown from "@eslint/markdown";
import css from "@eslint/css";
import { defineConfig } from "eslint/config";
import typescriptEslintParser from "@typescript-eslint/parser";
import unicorn from "eslint-plugin-unicorn";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginAstro from "eslint-plugin-astro";

export default defineConfig([
  {
    ignores: ["**/node_modules/**", "**/.astro/**", "**/dist/**"],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  tseslint.configs.recommended,
  {
    files: ["**/*.json"],
    plugins: { json },
    language: "json/json",
    extends: ["json/recommended"],
  },
  {
    files: ["**/*.md"],
    plugins: { markdown },
    language: "markdown/gfm",
    extends: ["markdown/recommended"],
  },
  {
    files: ["**/*.css"],
    plugins: { css },
    language: "css/css",
    extends: ["css/recommended"],
  },
  {
    files: ["**/*.ts"],
    ...unicorn.configs.recommended,
    languageOptions: {
      ...unicorn.configs.recommended.languageOptions,
      globals: globals.builtin,
      parser: typescriptEslintParser,
    },
    plugins: {
      ...unicorn.configs.recommended.plugins,
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      ...unicorn.configs.recommended.rules,
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
    },
  },
  ...eslintPluginAstro.configs.recommended,
  // UI components must not import Feature components.
  // See docs/adr/0001-component-layering.md
  {
    files: ["**/components/ui/**/*.{ts,mts,cts,js,mjs,cjs,astro}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/features", "**/features/*", "**/features/**"],
              message:
                "UI components must not import Feature components (one-way dependency: features -> ui). See docs/adr/0001-component-layering.md",
            },
          ],
        },
      ],
    },
  },
  // disable formatting rules of ESLint
  // so that only Prettier owns them
  // MUST BE LAST to overrides all previous rules
  eslintConfigPrettier,
]);
