import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateStoryIdea } from '../lib/storyteller';

// Mock the invokeEdgeFunction module
vi.mock('../lib/edge-functions', () => ({
  invokeEdgeFunction: vi.fn(),
}));

import { invokeEdgeFunction } from '../lib/edge-functions';

describe('storyteller.ts', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('generateStoryIdea should parse wrapped OpenAI-style response correctly', async () => {
        // Mock Response Structure (The Fix)
        const mockWrappedResponse = {
            data: {
                choices: [
                    {
                        message: {
                            content: JSON.stringify({
                                concept: {
                                    title_cz: "Test Title",
                                    author_name: "Test Author",
                                    character_desc_cz: "Test Character",
                                    short_blurb_cz: "Test Blurb"
                                },
                                technical_dna: {
                                    visual_anchors_en: ["anchor1"],
                                    color_palette: "Red",
                                    species_en: "Dragon",
                                    gender_en: "Neutral",
                                    size_age_en: "Giant",
                                    recommended_style: "Watercolor"
                                }
                            })
                        }
                    }
                ]
            },
            error: null
        };

        // TypeScript casting for the mock
        (invokeEdgeFunction as any).mockResolvedValue(mockWrappedResponse);

        const result = await generateStoryIdea();
        console.log("TEST RESULT:", JSON.stringify(result, null, 2));

        try {
            expect(result).toBeDefined();
            expect(result.title).toBe("Test Title");
            expect(result.visual_style).toBe("Watercolor");
            expect(result.visual_dna).toContain("VISUAL SPECIES: DRAGON");
            console.log("✅ First test assertions passed!");
        } catch (e) {
            console.error("❌ First test assertions FAILED:", e);
            throw e;
        }
    });

    it('generateStoryIdea should fallback on error', async () => {
        (invokeEdgeFunction as any).mockResolvedValue({ data: null, error: new Error("Fabricated Error") });

        const result = await generateStoryIdea();

        expect(result).toBeDefined();
        expect(result.title).toBe("Tajemství"); // Fallback title
        expect(result.author).toBe("Múza");
    });
});
