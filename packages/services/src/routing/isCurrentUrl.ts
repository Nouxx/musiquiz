function normalizePath(url: string): string {
  const [path = ""] = url.split(/[?#]/);
  return path.length > 1 ? path.replace(/\/$/, "") : path;
}

export function isCurrentUrl(pathname: string, url: string): boolean {
  const target = normalizePath(url);

  // a placeholder link (`"#todo"`) has no path, and so is never current
  if (target === "") return false;

  return normalizePath(pathname) === target;
}
