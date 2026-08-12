// `?raw` imports are a Vite feature, and its ambient types come from
// `vite/client`. This package does not depend on vite directly (astro owns it),
// so under pnpm's strict linking `"types": ["vite/client"]` would not resolve —
// hence declaring the one specifier shape the icon set needs.
declare module "*.svg?raw" {
  const contents: string;
  export default contents;
}