export type SanityQueryIssue = {
  /** @example "venuePage.pageCover.title" */
  path: string;
  message: string;
};

// lives here, not in @repo/api: apps/web never imports @repo/api
export class SanityQueryError extends Error {
  readonly kind: "parse" | "empty";
  /** @example "venuePage" */
  readonly queryName: string;
  readonly issues: SanityQueryIssue[];

  constructor({
    kind,
    queryName,
    issues,
  }: {
    kind: "parse" | "empty";
    queryName: string;
    issues: SanityQueryIssue[];
  }) {
    super(
      [
        `${kind} error in query ${queryName}`,
        ...issues.map((issue) => `${issue.path}: ${issue.message}`),
      ].join("\n"),
    );
    this.name = "SanityQueryError";
    this.kind = kind;
    this.queryName = queryName;
    this.issues = issues;
  }
}
