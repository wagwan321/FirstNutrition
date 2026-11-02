// Shared first-load timing. While the branded loader is on screen, hero intro
// animations wait for it; App sets introDelay to 0 once the loader is gone so
// later visits to the home page animate immediately.
export const LOADER_MS = 900
export const LOADER_FADE_MS = 450

export const boot = { introDelay: LOADER_MS }
