/**
 * Energy costs per story length (page count).
 * Used by CustomMode and HeroMode for cost calculation.
 */
export const STORY_COSTS: Record<number, number> = {
    5: 250,   // Quick Test
    10: 550,  // Standard
    15: 800,  // Extended
    25: 1300, // Epic
};
