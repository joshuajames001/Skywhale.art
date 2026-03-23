import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useBookReaderAdapter } from '../../providers/useBookReaderAdapter';

// ─── Supabase mock ───────────────────────────────────────────────────────
const mockBookSingle = vi.fn();
const mockPagesSelect = vi.fn();

vi.mock('../../lib/supabase', () => ({
    supabase: {
        from: (table: string) => {
            if (table === 'books') {
                return {
                    select: () => ({
                        eq: () => ({
                            single: () => mockBookSingle(),
                        }),
                    }),
                };
            }
            // pages table
            return {
                select: () => ({
                    eq: () => ({
                        order: () => mockPagesSelect(),
                    }),
                }),
            };
        },
    },
}));

// ─── Fixtures ────────────────────────────────────────────────────────────
const BOOK_DATA = {
    id: 'book-abc',
    title: 'Whale Story',
    author: 'Jiří',
    cover_image_url: 'https://cdn.test/cover.png',
    cover_prompt: 'A whale',
    character_seed: 42,
    visual_style: 'watercolor',
    visual_dna: 'Blue whale DNA',
    character_sheet_url: null,
    magic_mirror_url: null,
    tier: 'premium',
    target_audience: 'children',
    setting: 'Ocean',
    main_character: 'Luna',
};

const PAGES_DATA = [
    { id: 'p1', page_number: 1, content: 'Page 1 text', image_url: 'https://cdn.test/p1.png', art_prompt: '', layout_type: 'standard' },
    { id: 'p2', page_number: 2, content: 'Page 2 text', image_url: null, art_prompt: '', layout_type: null },
];

// ─── Tests ───────────────────────────────────────────────────────────────
describe('useBookReaderAdapter', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('fetchStoryById returns a mapped StoryBook on success', async () => {
        mockBookSingle.mockResolvedValueOnce({ data: BOOK_DATA, error: null });
        mockPagesSelect.mockResolvedValueOnce({ data: PAGES_DATA, error: null });

        const { result } = renderHook(() => useBookReaderAdapter());

        let story: any;
        await act(async () => {
            story = await result.current.fetchStoryById('book-abc');
        });

        expect(story).not.toBeNull();
        expect(story.book_id).toBe('book-abc');
        expect(story.title).toBe('Whale Story');
        expect(story.pages).toHaveLength(2);
        expect(story.pages[0].text).toBe('Page 1 text'); // content → text mapping
        expect(story.pages[1].layout_type).toBe('standard'); // fallback
    });

    it('sets loading=true during fetch, false after', async () => {
        mockBookSingle.mockResolvedValueOnce({ data: BOOK_DATA, error: null });
        mockPagesSelect.mockResolvedValueOnce({ data: PAGES_DATA, error: null });

        const { result } = renderHook(() => useBookReaderAdapter());

        expect(result.current.loading).toBe(false);

        let promise: Promise<any>;
        act(() => {
            promise = result.current.fetchStoryById('book-abc');
        });

        // loading should be true while fetching
        expect(result.current.loading).toBe(true);

        await act(async () => { await promise!; });

        expect(result.current.loading).toBe(false);
    });

    it('returns null and sets error when book not found', async () => {
        mockBookSingle.mockResolvedValueOnce({ data: null, error: { message: 'Not found' } });

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const { result } = renderHook(() => useBookReaderAdapter());

        let story: any;
        await act(async () => {
            story = await result.current.fetchStoryById('nonexistent');
        });

        expect(story).toBeNull();
        expect(result.current.error).toBeTruthy();
        consoleSpy.mockRestore();
    });

    it('returns null when pages fetch fails', async () => {
        mockBookSingle.mockResolvedValueOnce({ data: BOOK_DATA, error: null });
        mockPagesSelect.mockResolvedValueOnce({ data: null, error: { message: 'Pages error' } });

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const { result } = renderHook(() => useBookReaderAdapter());

        let story: any;
        await act(async () => {
            story = await result.current.fetchStoryById('book-abc');
        });

        expect(story).toBeNull();
        expect(result.current.error).toBeTruthy();
        consoleSpy.mockRestore();
    });

    it('maps DB fields to domain model correctly', async () => {
        mockBookSingle.mockResolvedValueOnce({ data: BOOK_DATA, error: null });
        mockPagesSelect.mockResolvedValueOnce({ data: PAGES_DATA, error: null });

        const { result } = renderHook(() => useBookReaderAdapter());

        let story: any;
        await act(async () => {
            story = await result.current.fetchStoryById('book-abc');
        });

        // DB → Domain mapping
        expect(story.cover_image).toBe('https://cdn.test/cover.png'); // cover_image_url → cover_image
        expect(story.theme_style).toBe('watercolor'); // visual_style → theme_style
        expect(story.tier).toBe('premium');
        expect(story.visual_dna).toBe('Blue whale DNA');
    });

    it('handles empty pages gracefully', async () => {
        mockBookSingle.mockResolvedValueOnce({ data: BOOK_DATA, error: null });
        mockPagesSelect.mockResolvedValueOnce({ data: [], error: null });

        const { result } = renderHook(() => useBookReaderAdapter());

        let story: any;
        await act(async () => {
            story = await result.current.fetchStoryById('book-abc');
        });

        expect(story).not.toBeNull();
        expect(story.pages).toEqual([]);
    });
});
