// @ts-check
import cloudflare from "@astrojs/cloudflare";
import { defineConfig, envField, fontProviders } from "astro/config";

// WARNING: process.env reads variables set by the CLI
// https://docs.astro.build/en/guides/environment-variables/#in-the-astro-config-file
// not named SSR: Vite already defines import.meta.env.SSR, which means
// "executing server-side" rather than "this build targets the SSR worker"
const isSsrBuild = process.env.SSR_BUILD === "true";

export default defineConfig({
  output: isSsrBuild ? "server" : "static",
  // output directory differs to prevent a build erasing the other
  outDir: isSsrBuild ? "./dist/ssr" : "./dist/static",
  adapter: isSsrBuild ? cloudflare({ imageService: "passthrough" }) : undefined,
  image: {
    // domains allow list for image optimization
    // only the static build needs it, the ssr build passthrough image service
    domains: isSsrBuild ? [] : ["cdn.sanity.io"],
  },
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Momo Trust Display",
      cssVariable: "--font-momo-trust-display",
      // google serves this face at 400 only
      weights: [400],
      styles: ["normal"],
      subsets: ["latin"],
    },
    {
      provider: fontProviders.google(),
      name: "Funnel Display",
      cssVariable: "--font-funnel-display",
      weights: [400, 600],
      styles: ["normal"],
      subsets: ["latin"],
    },
  ],
  // doc: https://docs.astro.build/en/guides/environment-variables/#variable-types
  env: {
    schema: {
      // this needs to be SANITY_STUDIO_ prefixed to be accessible by apps/sanity
      SANITY_STUDIO_PROJECT_ID: envField.string({
        context: "server",
        access: "public",
        optional: false,
      }),
      // this needs to be SANITY_STUDIO_ prefixed to be accessible by apps/sanity
      SANITY_STUDIO_DATASET: envField.string({
        context: "server",
        access: "public",
        optional: false,
      }),
      // It is **not** called `SSR`, because Vite already defines `import.meta.env.SSR`
      // to mean "this code is executing server-side"
      // a different claim from "this build targets the SSR worker"
      SSR_BUILD: envField.boolean({
        context: "server",
        access: "public",
        default: false,
      }),
      // viewer token, required by the ssr build
      SANITY_API_READ_TOKEN: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
    },
  },
  i18n: {
    locales: ["fr", "en"],
    defaultLocale: "fr",
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
