// Unpublish venues and the published docs they own, without touching a draft's
// content. Dry run unless --apply. Rules: CLAUDE.md, "Unpublishing an unfinished venue".
import {
  content,
  mutate,
  OWNED_TYPES,
  parseArgs,
  publishedId,
  query,
  strongRefPaths,
} from "./lib.mjs";
import { isDeepStrictEqual } from "node:util";

const { positional: venueIds, flags } = parseArgs(process.argv.slice(2));
const apply = flags.has("--apply");
if (!venueIds.length)
  throw new Error("usage: unpublish-venue <venueId…> [--apply]");

async function ownedTree(venueId) {
  const owned = new Set([venueId]);
  const mentions = [];
  const queue = [venueId];

  while (queue.length) {
    const id = queue.shift();
    const referrers = await query(
      `*[references($id) && !(_id in path("drafts.**"))]`,
      { id },
    );
    for (const referrer of referrers) {
      if (owned.has(referrer._id)) continue;
      if (
        OWNED_TYPES.includes(referrer._type) &&
        referrer.venue?._ref === venueId
      ) {
        owned.add(referrer._id);
        queue.push(referrer._id);
      } else if (strongRefPaths(referrer, new Set([id])).length) {
        mentions.push(`${referrer._id} (${referrer._type}) references ${id}`);
      }
    }
  }

  return { owned, mentions };
}

function weakened(doc, targets, typeOf) {
  const copy = structuredClone(doc);

  function walk(node) {
    if (Array.isArray(node)) return node.forEach(walk);
    if (!node || typeof node !== "object") return;
    if (targets.has(node._ref) && !node._weak) {
      node._weak = true;
      node._strengthenOnPublish = { type: typeOf.get(node._ref) };
    }
    Object.values(node).forEach(walk);
  }

  walk(copy);
  return copy;
}

function changedFields(published, draft) {
  const a = content(published);
  const b = content(draft);
  return [...new Set([...Object.keys(a), ...Object.keys(b)])].filter(
    (key) => !isDeepStrictEqual(a[key], b[key]),
  );
}

async function plan(venueId) {
  const [venue] = await query(`*[_id == $id && _type == "venue"]{ _id }`, {
    id: venueId,
  });
  if (!venue) return { blocked: ["not a published venue"] };

  const { owned, mentions } = await ownedTree(venueId);
  if (mentions.length) return { blocked: mentions };

  const ids = [...owned];
  const docs = await query(`*[_id in $ids]`, {
    ids: [...ids, ...ids.map((id) => `drafts.${id}`)],
  });
  const byId = new Map(docs.map((doc) => [doc._id, doc]));
  const typeOf = new Map(ids.map((id) => [id, byId.get(id)._type]));

  const moves = [];
  const deletes = [];
  const skipped = [];

  for (const id of ids) {
    const published = byId.get(id);
    const draft = byId.get(`drafts.${id}`);
    if (!draft) moves.push(published);
    else if (draft._updatedAt >= published._updatedAt) {
      deletes.push({ id, changed: changedFields(published, draft) });
    } else
      skipped.push(
        `${id} (${published._type}): published is newer than its draft`,
      );
  }
  if (skipped.length) return { blocked: skipped };

  const drafts = await query(
    `*[_id in path("drafts.**") && references($ids)]`,
    { ids },
  );
  const weakens = drafts
    .map((draft) => ({ draft, paths: strongRefPaths(draft, owned) }))
    .filter(({ paths }) => paths.length);
  const weakenedDrafts = new Set(weakens.map(({ draft }) => draft._id));

  const mutations = [
    // a kept draft discarded since plan() would leave no copy; weakened drafts carry their own guard
    ...deletes
      .map(({ id }) => byId.get(`drafts.${id}`))
      .filter((draft) => !weakenedDrafts.has(draft._id))
      .map((draft) => ({
        patch: { id: draft._id, ifRevisionID: draft._rev, set: {} },
      })),
    ...weakens.map(({ draft, paths }) => ({
      patch: {
        id: draft._id,
        ifRevisionID: draft._rev,
        set: Object.fromEntries(
          paths.flatMap(({ path, ref }) => [
            [`${path}._weak`, true],
            [`${path}._strengthenOnPublish`, { type: typeOf.get(ref) }],
          ]),
        ),
      },
    })),
    ...moves.map((published) => {
      const { _rev, _updatedAt, ...rest } = weakened(published, owned, typeOf);
      return { createIfNotExists: { ...rest, _id: `drafts.${published._id}` } };
    }),
    // delete takes no ifRevisionID; the empty patch aborts the transaction if a publish landed since plan()
    ...ids.flatMap((id) => [
      { patch: { id, ifRevisionID: byId.get(id)._rev, set: {} } },
      { delete: { id } },
    ]),
  ];

  return { ids, byId, moves, deletes, weakens, drafts, mutations };
}

async function verify({ ids, byId, drafts }) {
  const after = await query(`*[_id in $ids]`, {
    ids: [
      ...ids,
      ...ids.map((id) => `drafts.${id}`),
      ...drafts.map((d) => d._id),
    ],
  });
  const afterById = new Map(after.map((doc) => [doc._id, doc]));
  const problems = [];

  for (const id of ids) {
    if (afterById.has(id)) problems.push(`${id} still published`);
    const expected = byId.get(`drafts.${id}`) ?? byId.get(id);
    const draft = afterById.get(`drafts.${id}`);
    if (!draft || !isDeepStrictEqual(content(draft), content(expected))) {
      problems.push(`drafts.${id} content differs from before`);
    }
  }
  for (const draft of drafts) {
    const now = afterById.get(draft._id);
    if (!now || !isDeepStrictEqual(content(now), content(draft))) {
      problems.push(`${draft._id} content differs from before`);
    }
  }

  return problems;
}

for (const venueId of new Set(venueIds.map(publishedId))) {
  const result = await plan(venueId);
  const slug = result.byId?.get(venueId)?.slug?.current ?? venueId;

  if (result.blocked) {
    console.log(`\n✗ ${venueId} skipped:`);
    for (const line of result.blocked) console.log(`  ${line}`);
    continue;
  }

  console.log(`\n${apply ? "→" : "(dry run)"} ${slug} ${venueId}`);
  for (const doc of result.moves) {
    console.log(`  move to draft     ${doc._id} (${doc._type})`);
  }
  for (const { id, changed } of result.deletes) {
    console.log(
      `  delete published  ${id}, newer draft kept${changed.length ? `. Published-only values in: ${changed.join(", ")}` : ", identical"}`,
    );
  }
  for (const { draft, paths } of result.weakens) {
    console.log(
      `  weaken refs       ${draft._id}: ${paths.map(({ path }) => path).join(" | ")}`,
    );
  }

  if (!apply) continue;

  await mutate(result.mutations);
  const problems = await verify(result);
  console.log(
    problems.length ? `  ✗ ${problems.join("\n  ✗ ")}` : "  ✓ drafts intact",
  );
}

if (!apply) console.log("\nNothing written. Re-run with --apply.");
