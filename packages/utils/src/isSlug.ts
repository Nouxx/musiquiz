/**
 * ensure the provided is a slug,
 * which is useful to prevent malicious users to inject code and alter GROQ queries from the URL
 *
 * safe in SSG build, but extra security required for the SSR build */
export function isSlug(value: string): boolean {
  return /^[a-z0-9][a-z0-9-]{0,99}$/.test(value);
}
