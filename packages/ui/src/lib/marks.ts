// imported one by one rather than through `import.meta.glob` so that
// `keyof typeof` is a literal union: vite types a glob as `Record<string,string>`
// which would make every `name` a valid one and push typos to runtime

import fiftyFifty from "../marks/50-50.svg?raw";
import mute from "../marks/mute.svg?raw";
import theft from "../marks/theft.svg?raw";
import x2 from "../marks/x2.svg?raw";

export const marks = {
  "50-50": fiftyFifty,
  mute,
  theft,
  x2,
} as const;

export type MarkName = keyof typeof marks;
