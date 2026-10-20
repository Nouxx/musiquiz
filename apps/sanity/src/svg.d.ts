// `@repo/ui` reaches the map artwork through a `?raw` import, whose ambient
// types come from `vite/client` — a dependency the Studio does not own
declare module "*.svg?raw" {
  const contents: string;
  export default contents;
}

interface ImportMeta {
  glob<T>(
    pattern: string,
    options: { query: string; import: string; eager: true },
  ): Record<string, T>;
}
