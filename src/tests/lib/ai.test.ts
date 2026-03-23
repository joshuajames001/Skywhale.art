import { describe, it, expect, vi, beforeEach } from 'vitest';
import { STYLE_PROMPTS, generateImage, generateCardAsset } from '../../lib/ai';
import type { GenerateImageParams } from '../../lib/ai';

// ─── Mocks ───────────────────────────────────────────────────────────────
const mockInvokeEdgeFunction = vi.fn();

vi.mock('../../lib/edge-functions', () => ({
    invokeEdgeFunction: (...args: any[]) => mockInvokeEdgeFunction(...args),
}));

vi.mock('../../lib/supabase', () => ({
    supabase: {},
}));

// ─── Tests: Pure functions (exported) ────────────────────────────────────
// sanitizePrompt and reframePrompt are not exported, so we test them
// indirectly through generateImage's prompt processing.

describe('STYLE_PROMPTS', () => {
    it('has 17 style entries', () => {
        expect(Object.keys(STYLE_PROMPTS)).toHaveLength(17);
    });

    it('contains core styles', () => {
        expect(STYLE_PROMPTS).toHaveProperty('watercolor');
        expect(STYLE_PROMPTS).toHaveProperty('pixar_3d');
        expect(STYLE_PROMPTS).toHaveProperty('cyberpunk');
        expect(STYLE_PROMPTS).toHaveProperty('ghibli_anime');
        expect(STYLE_PROMPTS).toHaveProperty('pixel_art');
    });

    it('has backward-compat entries (capitalized)', () => {
        expect(STYLE_PROMPTS).toHaveProperty('Watercolor');
        expect(STYLE_PROMPTS).toHaveProperty('Pixar 3D');
    });
});

// ─── Tests: generateImage ────────────────────────────────────────────────
describe('generateImage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockInvokeEdgeFunction.mockResolvedValue({
            data: { imageUrl: 'https://cdn.test/img.png', usedSeed: 12345 },
            error: null,
        });
    });

    it('returns url and seed from edge function', async () => {
        const result = await generateImage({ prompt: 'A blue whale' });

        expect(result.url).toBe('https://cdn.test/img.png');
        expect(result.seed).toBe(12345);
    });

    it('calls generate-story-image edge function', async () => {
        await generateImage({ prompt: 'A whale' });

        expect(mockInvokeEdgeFunction).toHaveBeenCalledWith(
            'generate-story-image',
            expect.objectContaining({ prompt: expect.any(String) })
        );
    });

    it('sanitizes banned words in prompt', async () => {
        await generateImage({ prompt: 'A whale with a weapon and blood' });

        const call = mockInvokeEdgeFunction.mock.calls[0];
        const body = call[1];
        expect(body.prompt).not.toContain('weapon');
        expect(body.prompt).not.toContain('blood');
        expect(body.prompt).toContain('mystery');
    });

    it('adds fireflies to shadow prompts (reframe)', async () => {
        await generateImage({ prompt: 'Dark shadow in the forest' });

        const body = mockInvokeEdgeFunction.mock.calls[0][1];
        expect(body.prompt).toContain('fireflies');
    });

    it('applies style from STYLE_PROMPTS when key matches', async () => {
        await generateImage({ prompt: 'A scene', style: 'cyberpunk' });

        const body = mockInvokeEdgeFunction.mock.calls[0][1];
        expect(body.prompt).toContain('neon-noir');
    });

    it('uses default watercolor style when style is undefined', async () => {
        await generateImage({ prompt: 'A scene' });

        const body = mockInvokeEdgeFunction.mock.calls[0][1];
        expect(body.prompt).toContain('watercolor');
    });

    it('activates lunar cyberpunk override for moon + cyberpunk', async () => {
        await generateImage({ prompt: 'A scene', style: 'cyberpunk', setting: 'moon base' });

        const body = mockInvokeEdgeFunction.mock.calls[0][1];
        expect(body.prompt).toContain('lunar dust');
    });

    it('calculates kinetic seed from baseSeed + pageIndex', async () => {
        await generateImage({ prompt: 'A scene', baseSeed: 100, pageIndex: 2 });

        const body = mockInvokeEdgeFunction.mock.calls[0][1];
        expect(body.seed).toBe(100 + 2 * 15485863);
    });

    it('sets model to dev for basic tier', async () => {
        await generateImage({ prompt: 'A scene', tier: 'basic' });

        const body = mockInvokeEdgeFunction.mock.calls[0][1];
        expect(body.model).toBe('dev');
    });

    it('sets model to pro for pro tier', async () => {
        await generateImage({ prompt: 'A scene', tier: 'pro' });

        const body = mockInvokeEdgeFunction.mock.calls[0][1];
        expect(body.model).toBe('pro');
    });

    it('adds 8k resolution suffix for pro tier', async () => {
        await generateImage({ prompt: 'A scene', tier: 'pro' });

        const body = mockInvokeEdgeFunction.mock.calls[0][1];
        expect(body.prompt).toContain('8k resolution');
    });

    it('returns error object on edge function failure', async () => {
        mockInvokeEdgeFunction.mockResolvedValueOnce({
            data: null,
            error: new Error('Server Error'),
        });

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const result = await generateImage({ prompt: 'A scene' });

        expect(result.url).toBeNull();
        expect(result.error).toContain('Edge Function');
        consoleSpy.mockRestore();
    });

    it('sends characterReferences array for multi-ref', async () => {
        await generateImage({
            prompt: 'A scene',
            characterReferences: ['https://ref1.png', 'https://ref2.png'],
        });

        const body = mockInvokeEdgeFunction.mock.calls[0][1];
        expect(body.character_references).toEqual(['https://ref1.png', 'https://ref2.png']);
    });

    it('sends single character_reference when no multi-ref', async () => {
        await generateImage({
            prompt: 'A scene',
            characterReference: 'https://single-ref.png',
        });

        const body = mockInvokeEdgeFunction.mock.calls[0][1];
        expect(body.character_reference).toBe('https://single-ref.png');
        expect(body.image_prompt_url).toBe('https://single-ref.png');
    });
});

// ─── Tests: generateCardAsset ────────────────────────────────────────────
describe('generateCardAsset', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockInvokeEdgeFunction.mockResolvedValue({
            data: { imageUrl: 'https://cdn.test/card.png', usedSeed: 999 },
            error: null,
        });
    });

    it('prepends art style to prompt', async () => {
        await generateCardAsset({
            type: 'sticker',
            prompt: 'A cute dragon',
            themeStyle: 'Fantasy',
        });

        const body = mockInvokeEdgeFunction.mock.calls[0][1];
        expect(body.prompt).toContain('Art Style: Fantasy');
        expect(body.prompt).toContain('A cute dragon');
    });

    it('does not double-prepend if prompt already has Art Style', async () => {
        await generateCardAsset({
            type: 'background',
            prompt: 'Art Style: Space. Nebula background',
            themeStyle: 'Space',
        });

        const body = mockInvokeEdgeFunction.mock.calls[0][1];
        // Should NOT have double "Art Style:"
        const matches = body.prompt.match(/Art Style:/g);
        expect(matches).toHaveLength(1);
    });

    it('always uses dev model', async () => {
        await generateCardAsset({
            type: 'sticker',
            prompt: 'A star',
            themeStyle: 'Cosmic',
        });

        const body = mockInvokeEdgeFunction.mock.calls[0][1];
        expect(body.model).toBe('dev');
    });

    it('returns url and seed on success', async () => {
        const result = await generateCardAsset({
            type: 'background',
            prompt: 'Galaxy',
            themeStyle: 'Space',
        });

        expect(result.url).toBe('https://cdn.test/card.png');
        expect(result.seed).toBe(999);
    });

    it('returns error on failure', async () => {
        mockInvokeEdgeFunction.mockResolvedValueOnce({
            data: null,
            error: new Error('Timeout'),
        });

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const result = await generateCardAsset({
            type: 'sticker',
            prompt: 'Broken',
            themeStyle: 'Test',
        });

        expect(result.url).toBeNull();
        expect(result.error).toBe('Timeout');
        consoleSpy.mockRestore();
    });
});
