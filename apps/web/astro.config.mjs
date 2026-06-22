// @ts-check
import { defineConfig, fontProviders } from "astro/config";

export default defineConfig({
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
});
