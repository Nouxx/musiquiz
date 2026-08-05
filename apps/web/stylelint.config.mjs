/** @type {import('stylelint').Config} */
export default {
  extends: ["stylelint-config-standard", "stylelint-config-html"],
  plugins: ["stylelint-value-no-unknown-custom-properties"],
  rules: {
    "csstools/value-no-unknown-custom-properties": [
      true,
      { importFrom: ["../../packages/ui/src/styles/tokens.css"] },
    ],
  },
};
