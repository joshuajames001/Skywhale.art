import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CARD_THEMES, generateSmartQuote } from '../../lib/card-engine';

// ─── Mocks ───────────────────────────────────────────────────────────────
const mockInvokeEdgeFunction = vi.fn();
vi.mock('../../lib/edge-functions', () => ({
    invokeEdgeFunction: (...args: any[]) => mockInvokeEdgeFunction(...args),
}));

vi.mock('../../lib/moderation', () => ({
    assertContentSafe: vi.fn(),
}));

vi.mock('../../lib/i18n', () => ({
    default: {
        t: (key: string) => key,
    },
}));

// ─── Tests: CARD_THEMES ─────────────────────────────────────────────────
describe('CARD_THEMES', () => {
    it('has exactly 3 themes', () => {
        expect(Object.keys(CARD_THEMES)).toHaveLength(3);
    });

    it('contains space_party, fairytale_birthday, dino_adventure', () => {
        expect(CARD_THEMES).toHaveProperty('space_party');
        expect(CARD_THEMES).toHaveProperty('fairytale_birthday');
        expect(CARD_THEMES).toHaveProperty('dino_adventure');
    });

    it.each(Object.keys(CARD_THEMES))('%s has all required fields', (themeId) => {
        const theme = CARD_THEMES[themeId];
        expect(theme.id).toBe(themeId);
        expect(theme.label).toBeTruthy();
        expect(theme.description).toBeTruthy();
        expect(theme.bgPromptModifier).toBeTruthy();
        expect(theme.stickerPromptModifier).toBeTruthy();
        expect(theme.defaultStickers).toBeInstanceOf(Array);
        expect(theme.defaultStickers.length).toBeGreaterThan(0);
    });
});

// ─── Tests: generateSmartQuote ──────────────────────────────────────────
describe('generateSmartQuote', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns generated text on success', async () => {
        mockInvokeEdgeFunction.mockResolvedValueOnce({
            data: {
                choices: [{ message: { content: 'Všechno nejlepší k narozeninám!' } }],
            },
            error: null,
        });

        const result = await generateSmartQuote({
            occasion: 'Birthday',
            recipient: 'Grandma',
            mood: 'Heartfelt',
        });

        expect(result).toBe('Všechno nejlepší k narozeninám!');
        expect(mockInvokeEdgeFunction).toHaveBeenCalledWith('generate-story-content', {
            action: 'generate-card-text',
            payload: { occasion: 'Birthday', recipient: 'Grandma', mood: 'Heartfelt' },
        });
    });

    it('returns default greeting when AI returns empty', async () => {
        mockInvokeEdgeFunction.mockResolvedValueOnce({
            data: { choices: [{ message: { content: '' } }] },
            error: null,
        });

        const result = await generateSmartQuote({
            occasion: 'Birthday',
            recipient: 'Friend',
            mood: 'Funny',
        });

        // Empty string is falsy → falls back to t('atelier.default_greeting')
        expect(result).toBe('atelier.default_greeting');
    });

    it('returns default birthday on generic error', async () => {
        mockInvokeEdgeFunction.mockResolvedValueOnce({
            data: null,
            error: new Error('Network failure'),
        });

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const result = await generateSmartQuote({
            occasion: 'Birthday',
            recipient: 'Teacher',
            mood: 'Poetic',
        });

        expect(result).toBe('atelier.default_birthday');
        consoleSpy.mockRestore();
    });

    it('throws moderation error when content is flagged', async () => {
        mockInvokeEdgeFunction.mockResolvedValueOnce({
            data: null,
            error: new Error('Obsah není vhodný'),
        });

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        await expect(
            generateSmartQuote({
                occasion: 'Birthday',
                recipient: 'Enemy',
                mood: 'Angry',
            })
        ).rejects.toThrow('atelier.moderation_retry');

        consoleSpy.mockRestore();
    });
});
