import { SanityQueryError } from "@repo/utils/sanityQueryError";
import { describe, expect, it } from "vitest";
import { z } from "zod";

import { parseSanityData } from "./fetchData";

const schema = z.strictObject({
  page: z.strictObject({
    title: z.string(),
    sections: z.array(z.strictObject({ heading: z.string() })),
  }),
});

function parseError(data: unknown) {
  try {
    parseSanityData({ queryName: "testPage", schema, data });
  } catch (error) {
    if (error instanceof SanityQueryError) return error;
    throw error;
  }
  throw new Error("expected parseSanityData to throw");
}

describe("parseSanityData", () => {
  it("returns the parsed data when it matches the schema", () => {
    const data = { page: { title: "Lille", sections: [] } };

    expect(parseSanityData({ queryName: "testPage", schema, data })).toEqual(
      data,
    );
  });

  it("reports a parse error with the path of each broken field", () => {
    const error = parseError({
      page: { title: "Lille", sections: [{ heading: 1 }] },
    });

    expect(error.kind).toBe("parse");
    expect(error.queryName).toBe("testPage");
    expect(error.issues.map((issue) => issue.path)).toEqual([
      "page.sections[0].heading",
    ]);
  });

  it("reports an empty result when the query returns nothing", () => {
    // eslint-disable-next-line unicorn/no-null -- the client returns null for no match
    expect(parseError(null).kind).toBe("empty");
  });

  it("reports an empty result when the wrapped document is missing", () => {
    // eslint-disable-next-line unicorn/no-null -- GROQ projects a missing document as null
    expect(parseError({ page: null }).kind).toBe("empty");
  });
});
