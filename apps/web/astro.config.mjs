// @ts-check
import cloudflare from "@astrojs/cloudflare";
import { defineConfig, envField, fontProviders } from "astro/config";

// WARNING: process.env reads variables set by the CLI
// https://docs.astro.build/en/guides/environment-variables/#in-the-astro-config-file
const isPreview = process.env.PREVIEW === "true";

export default defineConfig({
  output: isPreview ? "server" : "static",
  // output directory differs to prevent a build erasing the other
  outDir: isPreview ? "./dist/preview" : "./dist/static",
  adapter: isPreview ? cloudflare({ imageService: "passthrough" }) : undefined,
  image: {
    // domains allow list for image optimization
    // only the static build needs it, preview build passthrough image service
    domains: isPreview ? [] : ["cdn.sanity.io"],
  },
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Inter",
      cssVariable: "--font-inter",
      weights: [400, 600, 700],
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
      // true only for the SSR preview build, which fetches draft content
      PREVIEW: envField.boolean({
        context: "server",
        access: "public",
        default: false,
      }),
      // viewer token, required by the SSR preview build
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
