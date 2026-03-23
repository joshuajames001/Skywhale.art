import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAppNavigation } from '../../../hooks/core/useAppNavigation';
import type { StoryBook } from '../../../types';

// ─── React Router mock ─────────────────────────────────────────────────────
const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
}));

// ─── i18n mock ─────────────────────────────────────────────────────────────
vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

// ─── useStory mock ─────────────────────────────────────────────────────────
const mockSaveStory = vi.fn();

vi.mock('../../../hooks/useStory', () => ({
    useStory: () => ({ saveStory: mockSaveStory }),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────
const makeStory = (overrides: Partial<StoryBook> = {}): StoryBook => ({
    book_id: 'book-001',
    title: 'Test Story',
    visual_style: 'fantasy',
    style_manifest: null,
    pages: [],
    created_at: new Date().toISOString(),
    is_public: false,
    user_id: 'user-1',
    cover_image_url: null,
    ...overrides,
} as unknown as StoryBook);

const renderNav = (isTransitioning = false) => {
    const triggerMagicTransition = vi.fn();
    const setCurrentAchievement = vi.fn();

    const hook = renderHook(() =>
        useAppNavigation(triggerMagicTransition, isTransitioning, setCurrentAchievement)
    );

    return { ...hook, triggerMagicTransition, setCurrentAchievement };
};

// ─── Tests ────────────────────────────────────────────────────────────────
describe('useAppNavigation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    // ── Initial state ──────────────────────────────────────────────────────

    it('starts with showPublishDialog=false and publishBookId=null', () => {
        const { result } = renderNav();
        expect(result.current.showPublishDialog).toBe(false);
        expect(result.current.publishBookId).toBeNull();
    });

    // ── handleStoryCreated ─────────────────────────────────────────────────

    it('navigates to /book/:id after story save succeeds', async () => {
        mockSaveStory.mockResolvedValue({ bookId: 'saved-123', achievements: [] });

        const { result } = renderNav();
        await act(async () => {
            await result.current.handleStoryCreated(makeStory());
        });

        expect(mockNavigate).toHaveBeenCalledWith('/book/saved-123');
    });

    it('shows publish dialog after 2s delay', async () => {
        mockSaveStory.mockResolvedValue({ bookId: 'saved-456', achievements: [] });

        const { result } = renderNav();
        await act(async () => {
            await result.current.handleStoryCreated(makeStory());
        });

        expect(result.current.showPublishDialog).toBe(false);

        act(() => vi.advanceTimersByTime(2000));

        expect(result.current.showPublishDialog).toBe(true);
        expect(result.current.publishBookId).toBe('saved-456');
    });

    it('shows first achievement toast on story save', async () => {
        const { result, setCurrentAchievement } = renderNav();
        const ach1 = { id: 'ach-1', title: 'First Book!', description: 'Congrats', icon: '📚', xp: 50 };
        const ach2 = { id: 'ach-2', title: 'Second', description: 'More', icon: '🏆', xp: 100 };

        mockSaveStory.mockResolvedValue({ bookId: 'saved-789', achievements: [ach1, ach2] });

        await act(async () => {
            await result.current.handleStoryCreated(makeStory());
        });

        expect(setCurrentAchievement).toHaveBeenCalledWith(ach1);
    });

    it('queues second achievement with 6s delay', async () => {
        const { result, setCurrentAchievement } = renderNav();
        const ach1 = { id: 'ach-1', title: 'A', description: '', icon: '⭐', xp: 10 };
        const ach2 = { id: 'ach-2', title: 'B', description: '', icon: '🌟', xp: 20 };

        mockSaveStory.mockResolvedValue({ bookId: 'x', achievements: [ach1, ach2] });

        await act(async () => {
            await result.current.handleStoryCreated(makeStory());
        });

        // ach1 shown immediately — ach2 not yet
        expect(setCurrentAchievement).toHaveBeenCalledTimes(1);

        act(() => vi.advanceTimersByTime(6000));
        expect(setCurrentAchievement).toHaveBeenCalledWith(ach2);
    });

    it('logs error and does not navigate when save fails', async () => {
        mockSaveStory.mockResolvedValue(null);
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const { result } = renderNav();
        await act(async () => {
            await result.current.handleStoryCreated(makeStory());
        });

        expect(mockNavigate).not.toHaveBeenCalled();
        consoleSpy.mockRestore();
    });

    // ── handleNewStoryClick ────────────────────────────────────────────────

    it('navigates to /create', () => {
        const { result } = renderNav();
        act(() => result.current.handleNewStoryClick());
        expect(mockNavigate).toHaveBeenCalledWith('/create');
    });

    // ── handleOpenBook ─────────────────────────────────────────────────────

    it('navigates to /book/:id for regular book', () => {
        const { result } = renderNav();
        act(() => result.current.handleOpenBook(makeStory({ book_id: 'book-99' })));
        expect(mockNavigate).toHaveBeenCalledWith('/book/book-99');
    });

    it('navigates to /studio with state for card_project_v1 with valid manifest', () => {
        const { result } = renderNav();
        const pages = [{ id: 1, content: 'hello' }];
        const story = makeStory({
            book_id: 'card-001',
            visual_style: 'card_project_v1',
            style_manifest: JSON.stringify(pages),
        });

        act(() => result.current.handleOpenBook(story));

        expect(mockNavigate).toHaveBeenCalledWith('/studio', {
            state: {
                initialProject: {
                    id: 'card-001',
                    title: story.title,
                    pages,
                },
            },
        });
    });

    it('falls back to /book/:id when card manifest is invalid JSON', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const { result } = renderNav();
        const story = makeStory({
            book_id: 'card-broken',
            visual_style: 'card_project_v1',
            style_manifest: 'NOT_JSON{{{',
        });

        act(() => result.current.handleOpenBook(story));

        expect(mockNavigate).toHaveBeenCalledWith('/book/card-broken');
        consoleSpy.mockRestore();
    });

    // ── handleHubNavigate ──────────────────────────────────────────────────

    const routeMap: Array<[string, string]> = [
        ['terms', '/terms'],
        ['intro', '/'],
        ['privacy', '/privacy'],
        ['pricing', '/pricing'],
        ['feedback_board', '/feedback'],
        ['library', '/library'],
        ['landing', '/home'],
        ['card_studio', '/studio'],
        ['arcade', '/arcade'],
        ['discovery', '/encyclopedia'],
        ['create_custom', '/custom'],
        ['energy_store', '/store'],
        ['profile', '/profile'],
    ];

    it.each(routeMap)('handleHubNavigate("%s") navigates to "%s"', (view, expectedPath) => {
        const { result } = renderNav();
        act(() => result.current.handleHubNavigate(view as any));
        expect(mockNavigate).toHaveBeenCalledWith(expectedPath);
    });

    it('triggers magic transition for "setup" when not transitioning', () => {
        const { result, triggerMagicTransition } = renderNav(false);
        act(() => result.current.handleHubNavigate('setup'));
        expect(triggerMagicTransition).toHaveBeenCalledWith('setup');
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('does NOT re-trigger magic transition for "setup" when already transitioning', () => {
        const { result, triggerMagicTransition } = renderNav(true);
        act(() => result.current.handleHubNavigate('setup'));
        expect(triggerMagicTransition).not.toHaveBeenCalled();
    });

    // ── handleBookFromLanding ──────────────────────────────────────────────

    it('navigates to /library when no bookId', async () => {
        const { result } = renderNav();
        await act(async () => result.current.handleBookFromLanding());
        expect(mockNavigate).toHaveBeenCalledWith('/library');
    });

    it('navigates to /book/:id when bookId provided', async () => {
        const { result } = renderNav();
        await act(async () => result.current.handleBookFromLanding('book-landing'));
        expect(mockNavigate).toHaveBeenCalledWith('/book/book-landing');
    });

    // ── Dialog state setters ───────────────────────────────────────────────

    it('setShowPublishDialog and setPublishBookId work correctly', () => {
        const { result } = renderNav();

        act(() => result.current.setShowPublishDialog(true));
        expect(result.current.showPublishDialog).toBe(true);

        act(() => result.current.setPublishBookId('my-book'));
        expect(result.current.publishBookId).toBe('my-book');

        act(() => result.current.setShowPublishDialog(false));
        expect(result.current.showPublishDialog).toBe(false);
    });
});
