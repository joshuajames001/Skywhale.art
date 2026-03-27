/**
 * Energy costs per image generation model.
 * Single source of truth — mirrored in supabase/functions/_shared/costs.ts for Edge Functions.
 */
export const IMAGE_COSTS = {
    FLUX_PRO: 40,   // Story illustrations + Magic Mirror (Flux 2 Pro)
    FLUX_DEV: 25,   // Custom Book without reference (Flux Dev)
    FLUX_CARD: 5,   // Card Studio / Stickers (Flux Dev/Schnell)
} as const;

/**
 * Energy costs per story length (page count).
 * Derived: (pages + 1 cover) * IMAGE_COSTS.FLUX_PRO
 */
export const STORY_COSTS: Record<number, number> = {
    3: (3 + 1) * IMAGE_COSTS.FLUX_PRO,    // 160 — Mini
    5: (5 + 1) * IMAGE_COSTS.FLUX_PRO,    // 240 — Quick
    10: (10 + 1) * IMAGE_COSTS.FLUX_PRO,  // 440 — Standard
    15: (15 + 1) * IMAGE_COSTS.FLUX_PRO,  // 640 — Extended
    25: (25 + 1) * IMAGE_COSTS.FLUX_PRO,  // 1040 — Epic
};
