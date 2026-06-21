/** @type {import('stylelint').Config} */
export default {
  plugins: ["stylelint-value-no-unknown-custom-properties"],
  // tokens.css references --font-inter, a var generated at runtime by the
  // Astro Fonts API (not present in any source file). Skip linting it so the
  // rule doesn't flag that one runtime var. See docs/adr/0002-css-strategy.md.
  ignoreFiles: ["src/styles/tokens.css"],
  rules: {
    "csstools/value-no-unknown-custom-properties": [
      true,
      { importFrom: ["src/styles/tokens.css"] },
    ],
  },
  overrides: [
    // Parse <style> blocks inside .astro files.
    { files: ["**/*.astro"], customSyntax: "postcss-html" },
  ],
};
