// The list of challenge packs.
// To add a pack: create content/pack-<name>.js using content/SCHEMA.md,
// import it below, add it to PACKS, then run: node tools/verify-content.mjs

import beginner from "./pack-beginner.js";
import developer from "./pack-developer.js";

export const PACKS = [beginner, developer];
