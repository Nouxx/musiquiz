import { defineConfig } from "eslint/config";
import config from "eslint-config";

export default defineConfig([
  config,
  {
    // every Query Module declares a Zod schema, and Zod nests by construction:
    // z.array(z.strictObject({ name: z.string().min(1) })) is already 3 deep.
    // Suppressing it per file meant the same header comment in every module.
    files: ["src/sanity/**/*.ts"],
    rules: { "unicorn/max-nested-calls": "off" },
  },
]);
