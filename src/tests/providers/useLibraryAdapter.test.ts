import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useLibraryAdapter } from '../../providers/useLibraryAdapter';

// ─── Supabase mock ───────────────────────────────────────────────────────
const mockResults: any[] = [];
let resultIndex = 0;

const makeChain = () => {
    const chain: any = {
        select: () => chain,
        eq: () => chain,
        neq: () => chain,
        in: () => chain,
        order: () => chain,
        limit: () => chain,
        single: () => Promise.resolve(mockResults[resultIndex++] || { data: null }),
        maybeSingle: () => Promise.resolve(mockResults[resultIndex++] || { data: null }),
        insert: (data: any) => {
            mockResults[resultIndex++]; // consume
            return Promise.resolve({ error: null });
        },
        delete: () => chain,
        update: (data: any) => chain,
        // Make thenable for queries that end without .single()
        then: (resolve: any, reject?: any) => {
            const r = mockResults[resultIndex++] || { data: [], error: null };
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

vi.mock('../../lib/content-policy', () => ({
    checkTopicBlacklist: vi.fn().mockReturnValue({ blocked: false }),
}));

const mockModerateContent = vi.fn();
vi.mock('../../lib/moderation', () => ({
    moderateContent: (...args: any[]) => mockModerateContent(...args),
}));

// ─── Setup ───────────────────────────────────────────────────────────────
const onOpenBook = vi.fn();
const onOpenMagic = vi.fn();
const onCreateCustom = vi.fn();
const onCreateCard = vi.fn();

const makeAdapter = () => useLibraryAdapter({ onOpenBook, onOpenMagic, onCreateCustom, onCreateCard });

// ─── Fixtures ────────────────────────────────────────────────────────────
const BOOK_ROW = {
    id: 'book-1',
    title: 'Test Book',
    owner_id: 'user-1',
    cover_image_url: 'https://cdn.test/cover.png',
    pages: [{ page_number: 1, content: 'Hello', image_url: null }],
    profiles: null,
};

// ─── Tests ───────────────────────────────────────────────────────────────
describe('useLibraryAdapter', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockResults.length = 0;
        resultIndex = 0;
    });

    it('returns all adapter methods', () => {
        const adapter = makeAdapter();
        expect(adapter.fetchBooks).toBeInstanceOf(Function);
        expect(adapter.togglePublicStatus).toBeInstanceOf(Function);
        expect(adapter.deleteBook).toBeInstanceOf(Function);
        expect(adapter.toggleFavorite).toBeInstanceOf(Function);
        expect(adapter.getFavoriteIds).toBeInstanceOf(Function);
        expect(adapter.onOpenBook).toBe(onOpenBook);
        expect(adapter.onOpenMagic).toBe(onOpenMagic);
        expect(adapter.onCreateCustom).toBe(onCreateCustom);
        expect(adapter.onCreateCard).toBe(onCreateCard);
    });

    describe('fetchBooks', () => {
        it('returns mapped books for private tab', async () => {
            mockResults.push({ data: [BOOK_ROW], error: null });

            const adapter = makeAdapter();
            const books = await adapter.fetchBooks('private', 'user-1');

            expect(books).toHaveLength(1);
            expect(books[0].book_id).toBe('book-1');
            expect(books[0].cover_image).toBe('https://cdn.test/cover.png');
        });

        it('returns empty array for private tab without userId', async () => {
            const adapter = makeAdapter();
            const books = await adapter.fetchBooks('private');
            expect(books).toEqual([]);
        });

        it('returns empty array for cards tab without userId', async () => {
            const adapter = makeAdapter();
            const books = await adapter.fetchBooks('cards');
            expect(books).toEqual([]);
        });

        it('returns empty for favorites when user has none', async () => {
            // favorites query returns empty
            mockResults.push({ data: [], error: null });

            const adapter = makeAdapter();
            const books = await adapter.fetchBooks('favorites', 'user-1');
            expect(books).toEqual([]);
        });
    });

    describe('deleteBook', () => {
        it('returns true on successful delete', async () => {
            // delete chain resolves without error via thenable
            mockResults.push({ error: null });

            const adapter = makeAdapter();
            const result = await adapter.deleteBook('book-1', 'user-1');
            expect(result).toBe(true);
        });
    });

    describe('getFavoriteIds', () => {
        it('returns array of book IDs', async () => {
            mockResults.push({
                data: [{ book_id: 'book-1' }, { book_id: 'book-2' }],
                error: null,
            });

            const adapter = makeAdapter();
            const ids = await adapter.getFavoriteIds('user-1');
            expect(ids).toEqual(['book-1', 'book-2']);
        });

        it('returns empty array on error', async () => {
            mockResults.push({ data: null, error: { message: 'DB error' } });

            const adapter = makeAdapter();
            const ids = await adapter.getFavoriteIds('user-1');
            expect(ids).toEqual([]);
        });
    });

    describe('togglePublicStatus', () => {
        it('updates status without moderation when making private', async () => {
            // update chain resolves
            mockResults.push({ error: null });

            const adapter = makeAdapter();
            const result = await adapter.togglePublicStatus('book-1', true, 'user-1');
            expect(result.success).toBe(true);
            // moderateContent should NOT be called when making private (currentStatus=true → newStatus=false)
            expect(mockModerateContent).not.toHaveBeenCalled();
        });
    });
});
