# One prices block per page

`venuePrices` and `gamePrices` are entries in the shared Page Component dictionary, so nothing stopped a page from holding several. Both render `Prices` and anchor at `#prices`. Two on a page meant two `id="prices"`: invalid HTML, a `#prices` link that only reaches the first one, and a Site URLs row that cannot reach the second.

A page now holds **at most one prices block**, `venuePrices` or `gamePrices`, counted across every Page Component array the page renders. That means `pageComponents` on most pages, both widget arrays on the booking and gifting pages, and both map arrays on the where-to-find-us page. The **booking page holds exactly one `venuePrices`**, because its Page Cover's secondary button is hardcoded to `#prices`.

The rule is a `rule.custom` on the `pageComponents` array type, so every field of that type inherits it. It reads the whole document through `context.document`. A hidden array keeps its old value, so arrays the page does not render are skipped, the same way `siteAnchors.ts` skips them. A breach is an error, and the Studio refuses to publish.

## Alternative: one id per instance, `prices-<_key>`

Every block stays reachable and nothing needs validating.

Rejected. Editors copy anchors from the Site URLs tool into authored links, and `#prices` is stable while `#prices-3f9a…` changes whenever a block is recreated. The tool would also have to list one row per instance, and the booking page's hardcoded `#prices` would have no single target.

## Alternative: hide the other block from the insert menu

An array's `of` is static in Sanity. Filtering the insert menu per document needs a custom array input. Too much to maintain for a rule editors seldom meet. The editor can still add a second block; the error on the array says to remove one.

## Consequences

- `gamePrices` now anchors at `#prices`, and `venueGame` pages list a `#prices` row in the Site URLs tool.
- A write that skips the Studio (MCP, a migration, a seed) can still break the rule. `pnpm build` does not check it.
