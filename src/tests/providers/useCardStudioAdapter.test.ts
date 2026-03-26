import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCardStudioAdapter } from '../../providers/useCardStudioAdapter';

// ─── Supabase mock ───────────────────────────────────────────────────────
const mockResults: any[] = [];
let resultIndex = 0;

const makeChain = () => {
    const chain: any = {
        select: () => chain,
        eq: () => chain,
        insert: () => chain,
        single: () => Promise.resolve(mockResults[resultIndex++] || { data: null }),
        then: (resolve: any, reject?: any) => {
            const r = mockResults[resultIndex++] || { data: null, error: null };
            return Promise.resolve(r).then(resolve, reject);
        },
    };
    return chain;
};

vi.mock('../../lib/supabase', () => ({
    supabase: {
        from: () => makeChain(),
    },
}));

// ─── useStory mock ──────────────────────────────────────────────────────
const mockSaveCardProject = vi.fn().mockResolvedValue(true);
vi.mock('../../hooks/useStory', () => ({
    useStory: () => ({ saveCardProject: mockSaveCardProject }),
}));

// ─── useGemini mock ─────────────────────────────────────────────────────
const mockSearchDictionary = vi.fn().mockResolvedValue({ result: 'test' });
const mockGenerateImagePrompt = vi.fn().mockResolvedValue('translated prompt');
vi.mock('../../hooks/useGemini', () => ({
    useGemini: () => ({
        searchDictionary: mockSearchDictionary,
        generateImagePrompt: mockGenerateImagePrompt,
    }),
}));

// ─── Edge function mock ─────────────────────────────────────────────────
const mockInvokeEdgeFunction = vi.fn();
vi.mock('../../lib/edge-functions', () => ({
    invokeEdgeFunction: (...args: any[]) => mockInvokeEdgeFunction(...args),
}));

// ─── Moderation mock ────────────────────────────────────────────────────
const mockAssertContentSafe = vi.fn().mockResolvedValue(undefined);
vi.mock('../../lib/moderation', () => ({
    assertContentSafe: (...args: any[]) => mockAssertContentSafe(...args),
}));

// ─── Setup ──────────────────────────────────────────────────────────────
const MOCK_USER = { id: 'user-1' } as any;
const makeAdapter = (user = MOCK_USER) => useCardStudioAdapter(user);

const MOCK_PAGES = [
    { id: 'p0', name: 'Cover', items: [], background: '#fff' },
    { id: 'p1', name: 'Inside', items: [{ id: 'i1', type: 'text' as const, content: 'Hello', x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 }], background: '#eee' },
];

// ─── Tests ──────────────────────────────────────────────────────────────
describe('useCardStudioAdapter', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockResults.length = 0;
        resultIndex = 0;
    });

    it('returns all adapter methods', () => {
        const adapter = makeAdapter();
        expect(adapter.onSaveProject).toBeInstanceOf(Function);
        expect(adapter.onGenerateImage).toBeInstanceOf(Function);
        expect(adapter.onShareCard).toBeInstanceOf(Function);
        expect(adapter.onModerateContent).toBeInstanceOf(Function);
        expect(adapter.onDictionaryLookup).toBeInstanceOf(Function);
        expect(adapter.onTranslate).toBeInstanceOf(Function);
    });

    it('exposes user when provided', () => {
        const adapter = makeAdapter();
        expect(adapter.user).toEqual({ id: 'user-1' });
    });

    it('exposes null user when not provided', () => {
        const adapter = makeAdapter(null);
        expect(adapter.user).toBeNull();
    });

    describe('onSaveProject', () => {
        it('delegates to useStory.saveCardProject', async () => {
            const adapter = makeAdapter();
            const project = { id: 'p1', title: 'Card', pages: MOCK_PAGES, thumbnailBlob: new Blob() };
            await adapter.onSaveProject(project);
            expect(mockSaveCardProject).toHaveBeenCalledWith(project);
        });
    });

    describe('onGenerateImage', () => {
        it('calls skywhale-flux edge function and returns imageUrl', async () => {
            mockInvokeEdgeFunction.mockResolvedValue({
                data: { imageUrl: 'https://cdn.test/sticker.png' },
                error: null,
            });

            const adapter = makeAdapter();
            const result = await adapter.onGenerateImage('cute cat', 'sticker');

            expect(mockInvokeEdgeFunction).toHaveBeenCalledWith('skywhale-flux', {
                prompt: 'cute cat',
                mode: 'sticker',
                model: 'schnell',
                image_prompt: undefined,
            });
            expect(result.imageUrl).toBe('https://cdn.test/sticker.png');
        });

        it('passes referenceUrl as image_prompt', async () => {
            mockInvokeEdgeFunction.mockResolvedValue({
                data: { imageUrl: 'https://cdn.test/bg.png' },
                error: null,
            });

            const adapter = makeAdapter();
            await adapter.onGenerateImage('forest', 'background', 'https://ref.png');

            expect(mockInvokeEdgeFunction).toHaveBeenCalledWith('skywhale-flux', {
                prompt: 'forest',
                mode: 'background',
                model: 'schnell',
                image_prompt: 'https://ref.png',
            });
        });

        it('throws on edge function error', async () => {
            mockInvokeEdgeFunction.mockResolvedValue({
                data: null,
                error: { message: 'Rate limited' },
            });

            const adapter = makeAdapter();
            await expect(adapter.onGenerateImage('test', 'sticker')).rejects.toThrow('Rate limited');
        });

        it('throws generic error when no imageUrl returned', async () => {
            mockInvokeEdgeFunction.mockResolvedValue({ data: {}, error: null });

            const adapter = makeAdapter();
            await expect(adapter.onGenerateImage('test', 'sticker')).rejects.toThrow('Generation failed');
        });
    });

    describe('onShareCard', () => {
        it('inserts into shared_cards and returns shareUrl', async () => {
            mockResults.push({ data: { id: 'card-uuid-123' }, error: null });

            const adapter = makeAdapter();
            const result = await adapter.onShareCard(MOCK_PAGES as any);

            expect(result).not.toBeNull();
            expect(result!.shareUrl).toContain('/card/card-uuid-123');
        });

        it('returns null when user is not authenticated', async () => {
            const adapter = makeAdapter(null);
            const result = await adapter.onShareCard(MOCK_PAGES as any);
            expect(result).toBeNull();
        });

        it('returns null on supabase error', async () => {
            mockResults.push({ data: null, error: { message: 'DB error' } });

            const adapter = makeAdapter();
            const result = await adapter.onShareCard(MOCK_PAGES as any);
            expect(result).toBeNull();
        });
    });

    describe('onModerateContent', () => {
        it('delegates to assertContentSafe', async () => {
            const adapter = makeAdapter();
            await adapter.onModerateContent('test text');
            expect(mockAssertContentSafe).toHaveBeenCalledWith('test text');
        });

        it('propagates moderation errors', async () => {
            mockAssertContentSafe.mockRejectedValueOnce(new Error('Content blocked'));
            const adapter = makeAdapter();
            await expect(adapter.onModerateContent('bad text')).rejects.toThrow('Content blocked');
        });
    });

    describe('onDictionaryLookup', () => {
        it('delegates to useGemini.searchDictionary', async () => {
            const adapter = makeAdapter();
            const result = await adapter.onDictionaryLookup('dinosaur');
            expect(mockSearchDictionary).toHaveBeenCalledWith('dinosaur');
            expect(result).toEqual({ result: 'test' });
        });
    });

    describe('onTranslate', () => {
        it('delegates to useGemini.generateImagePrompt', async () => {
            const adapter = makeAdapter();
            const result = await adapter.onTranslate('kočka na měsíci');
            expect(mockGenerateImagePrompt).toHaveBeenCalledWith('kočka na měsíci');
            expect(result).toBe('translated prompt');
        });
    });
});
