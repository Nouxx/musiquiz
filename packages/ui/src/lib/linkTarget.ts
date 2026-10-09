export function linkTarget(external: boolean | undefined) {
  return external ? { target: "_blank", rel: "noopener" } : {};
}
