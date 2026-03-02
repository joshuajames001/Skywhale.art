import { describe, it, expect, vi, beforeEach } from 'vitest';
import { moderateContent } from '../lib/moderation';

const mockInvokeEdgeFunction = vi.fn();

vi.mock('../lib/edge-functions', () => ({
    invokeEdgeFunction: (...args: any[]) => mockInvokeEdgeFunction(...args),
}));

vi.mock('../lib/i18n', () => ({
    default: {
        t: (key: string, _opts?: any) => key,
    },
}));

const cleanCategories = {
    sexual: false,
    hate: false,
    harassment: false,
    'self-harm': false,
    'sexual/minors': false,
    'hate/threatening': false,
    'violence/graphic': false,
    violence: false,
};

describe('moderateContent', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns flagged:false for clean text', async () => {
        mockInvokeEdgeFunction.mockResolvedValue({
            data: {
                results: [{ flagged: false, categories: cleanCategories }]
            },
            error: null,
        });

        const result = await moderateContent('Malý drak letěl nad horou.');

        expect(result.flagged).toBe(false);
        expect(result.categories).toBeDefined();
    });

    it('returns flagged:true with categories for inappropriate text', async () => {
        const flaggedCategories = { ...cleanCategories, sexual: true, 'sexual/minors': true };

        mockInvokeEdgeFunction.mockResolvedValue({
            data: {
                results: [{ flagged: true, categories: flaggedCategories }]
            },
            error: null,
        });

        const result = await moderateContent('nevhodný obsah');

        expect(result.flagged).toBe(true);
        expect(result.categories.sexual).toBe(true);
        expect(result.reason).toBeDefined();
    });

    it('returns flagged:true for violence category', async () => {
        const flaggedCategories = { ...cleanCategories, violence: true, 'violence/graphic': true };

        mockInvokeEdgeFunction.mockResolvedValue({
            data: {
                results: [{ flagged: true, categories: flaggedCategories }]
            },
            error: null,
        });

        const result = await moderateContent('grafické násilí');

        expect(result.flagged).toBe(true);
        expect(result.categories.violence).toBe(true);
    });

    it('conservative fallback: returns flagged:true on API error', async () => {
        mockInvokeEdgeFunction.mockResolvedValue({
            data: null,
            error: new Error('Network error'),
        });

        const result = await moderateContent('jakýkoli text');

        expect(result.flagged).toBe(true);
        expect(result.reason).toBeDefined();
    });

    it('conservative fallback: returns flagged:true when invokeEdgeFunction throws', async () => {
        mockInvokeEdgeFunction.mockRejectedValue(new Error('Fetch failed'));

        const result = await moderateContent('jakýkoli text');

        expect(result.flagged).toBe(true);
    });

    it('conservative fallback: returns flagged:true when data is null', async () => {
        mockInvokeEdgeFunction.mockResolvedValue({ data: null, error: null });

        const result = await moderateContent('text');

        expect(result.flagged).toBe(true);
    });
});
