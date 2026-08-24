export const VISIBLE_DEPTH = 3;

const TILTS = [0, 2.5, -2, 3, -1.5, 2];

export function tiltAtDepth(depth: number) {
  return TILTS[depth % TILTS.length] ?? 0;
}

export function depthStyle(depth: number) {
  return {
    "--depth": String(depth),
    "--tilt": `${tiltAtDepth(depth)}deg`,
  };
}
