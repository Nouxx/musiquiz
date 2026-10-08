import { expect, it } from "vitest";

import { toInlineScriptJson } from "./toInlineScriptJson";

it("escapes a closing script tag", () => {
  expect(toInlineScriptJson({ text: "</script><script>alert(1)" })).toBe(
    String.raw`{"text":"\u003c/script>\u003cscript>alert(1)"}`,
  );
});

it("parses back to the same value", () => {
  const value = { text: "a < b", list: ["<!--"] };

  expect(JSON.parse(toInlineScriptJson(value))).toEqual(value);
});
