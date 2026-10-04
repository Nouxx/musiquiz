// for `set:html` inside a <script>: a raw `<` in a value could close the element early
export function toInlineScriptJson(value: unknown) {
  return JSON.stringify(value).replaceAll("<", String.raw`\u003c`);
}
