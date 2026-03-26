import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useGameHubAdapter } from '../../providers/useGameHubAdapter';

// ─── Supabase mock ───────────────────────────────────────────────────────
const mockResults: any[] = [];
let resultIndex = 0;

const makeChain = () => {
    const chain: any = {
        select: () => chain,
        eq: () => chain,
        order: () => chain,
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

// ─── Setup ──────────────────────────────────────────────────────────────
const mockOnExit = vi.fn();
const makeAdapter = () => useGameHubAdapter(mockOnExit);

// ─── Fixtures ───────────────────────────────────────────────────────────
const BOOK_ROWS = [
    { id: 'book-1', title: 'Dino Adventure', cover_image_url: 'https://cdn.test/dino.png' },
    { id: 'book-2', title: 'Space Journey', cover_image_url: null },
];

const PAGE_ROWS = [
    { image_url: 'https://cdn.test/page1.png' },
    { image_url: 'https://cdn.test/page2.png' },
    { image_url: null },
];

// ─── Tests ──────────────────────────────────────────────────────────────
describe('useGameHubAdapter', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockResults.length = 0;
        resultIndex = 0;
    });

    it('returns all adapter methods', () => {
        const adapter = makeAdapter();
        expect(adapter.onFetchBooks).toBeInstanceOf(Function);
        expect(adapter.onFetchPages).toBeInstanceOf(Function);
        expect(adapter.onExit).toBe(mockOnExit);
    });

    describe('onFetchBooks', () => {
        it('returns mapped GameAsset array', async () => {
            mockResults.push({ data: BOOK_ROWS, error: null });

            const adapter = makeAdapter();
            const books = await adapter.onFetchBooks();

            expect(books).toHaveLength(2);
            expect(books[0]).toEqual({ id: 'book-1', title: 'Dino Adventure', coverUrl: 'https://cdn.test/dino.png' });
            expect(books[1]).toEqual({ id: 'book-2', title: 'Space Journey', coverUrl: null });
        });

        it('returns empty array when data is null', async () => {
            mockResults.push({ data: null, error: { message: 'DB error' } });

            const adapter = makeAdapter();
            const books = await adapter.onFetchBooks();
            expect(books).toEqual([]);
        });
    });

    describe('onFetchPages', () => {
        it('returns filtered image URL array', async () => {
            mockResults.push({ data: PAGE_ROWS, error: null });

            const adapter = makeAdapter();
            const urls = await adapter.onFetchPages('book-1');

            expect(urls).toEqual([
                'https://cdn.test/page1.png',
                'https://cdn.test/page2.png',
            ]);
        });

        it('returns empty array when pages is null', async () => {
            mockResults.push({ data: null, error: { message: 'DB error' } });

            const adapter = makeAdapter();
            const urls = await adapter.onFetchPages('book-1');
            expect(urls).toEqual([]);
        });
    });

    describe('onExit', () => {
        it('calls the provided onExit callback', () => {
            const adapter = makeAdapter();
            adapter.onExit();
            expect(mockOnExit).toHaveBeenCalledOnce();
        });
    });
});
