/** @type {import('stylelint').Config} */
export default {
  extends: ["stylelint-config-standard", "stylelint-config-html"],
  plugins: ["stylelint-value-no-unknown-custom-properties"],
  rules: {
    "selector-pseudo-class-no-unknown": [
      true,
      /* :global belongs to Astro which reads it at build time to skip its scoping hash */
      { ignorePseudoClasses: ["global"] },
    ],
    "csstools/value-no-unknown-custom-properties": [
      true,
      { importFrom: ["../../packages/ui/src/styles/tokens.css"] },
    ],
  },
};
