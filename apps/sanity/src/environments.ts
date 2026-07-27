// sanity studio requires env var to be referenced with the static string
// https://www.sanity.io/docs/studio/environment-variables#k55b660b13cc7
// BUT
// destructuring `process.env` does not count as a static reference: the bundler
// replaces the whole object with `{}` each var has to be read as `process.env.THE_FULL_NAME`
function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing ${name} env var`);
  }

  return value;
}

export const projectId = required(
  "SANITY_STUDIO_PROJECT_ID",
  process.env.SANITY_STUDIO_PROJECT_ID,
);

export const dataset = required(
  "SANITY_STUDIO_DATASET",
  process.env.SANITY_STUDIO_DATASET,
);

export const appId = process.env.SANITY_STUDIO_APP_ID;
