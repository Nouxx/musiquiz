import { expect, it } from "vitest";

import { schemaTypes } from "../";

type Node = {
  name?: string;
  type?: string;
  fields?: Node[];
  of?: Node[];
  validation?: (rule: unknown) => unknown;
};

type Custom = (value: unknown, context: unknown) => unknown;

function localizedFields(node: Node, path: string): [string, Node][] {
  const here = node.type?.startsWith("internationalizedArray")
    ? [[path, node] as [string, Node]]
    : [];
  const children = [...(node.fields ?? []), ...(node.of ?? [])];

  return [
    ...here,
    ...children.flatMap((child) =>
      localizedFields(child, `${path}.${child.name ?? child.type}`),
    ),
  ];
}

type Chain = { customs: Custom[]; warning: boolean };

const chainOf = Symbol("chain");

// `Rule` is not exported by `sanity`. Like it, each call returns a new chain,
// so `[rule.custom(a), rule.custom(b).warning()]` keeps `a` an error
function fakeRule(chain: Chain): object {
  return new Proxy(
    {},
    {
      get: (_, method) =>
        method === chainOf
          ? chain
          : function call(arg?: unknown) {
              return fakeRule({
                customs:
                  method === "custom"
                    ? [...chain.customs, arg as Custom]
                    : chain.customs,
                warning: chain.warning || method === "warning",
              });
            },
    },
  );
}

function errorValidators(validation: Node["validation"]) {
  const result = validation?.(fakeRule({ customs: [], warning: false }));
  const rules = (Array.isArray(result) ? result : [result]).filter(Boolean);

  return rules
    .map((rule) => (rule as Record<symbol, Chain>)[chainOf])
    .filter((chain) => !chain.warning)
    .flatMap((chain) => chain.customs);
}

function frenchOnly(type: string) {
  const value = type.endsWith("RichText")
    ? [{ _type: "block", children: [{ _type: "span", text: "Bonjour" }] }]
    : "Bonjour";

  return [
    { _key: "fr", language: "fr", value },
    { _key: "en", language: "en" },
  ];
}

// conditional validators (pop-up on, offer card in text mode, cta in use) must apply
const context = {
  document: { enabled: true },
  parent: {
    contentType: "text",
    label: frenchOnly("internationalizedArrayString"),
  },
};

const fields = schemaTypes.flatMap((type) =>
  localizedFields(type as Node, type.name),
);

it("finds the localized fields", () => {
  expect(fields.length).toBeGreaterThan(50);
});

it.each(fields)("%s refuses a missing language", async (_, field) => {
  const results = await Promise.all(
    errorValidators(field.validation).map((custom) =>
      custom(frenchOnly(field.type!), context),
    ),
  );

  expect(results.some((result) => result !== true)).toBe(true);
});
