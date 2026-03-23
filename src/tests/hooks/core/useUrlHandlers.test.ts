import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUrlHandlers } from '../../../hooks/core/useUrlHandlers';

// ─── React Router mock ─────────────────────────────────────────────────────
const mockNavigate = vi.fn();
let mockLocationSearch = '';

vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
    useLocation: () => ({ search: mockLocationSearch }),
}));

// ─── i18n mock ─────────────────────────────────────────────────────────────
vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────
const setWindowSearch = (search: string) => {
    Object.defineProperty(window, 'location', {
        writable: true,
        value: { ...window.location, search },
    });
};

const renderHandler = (setCurrentAchievement = vi.fn()) => {
    return renderHook(() => useUrlHandlers(setCurrentAchievement));
};

// ─── Tests ────────────────────────────────────────────────────────────────
describe('useUrlHandlers', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        mockLocationSearch = '';
        setWindowSearch('');
        localStorage.clear();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    // ── Referral code ──────────────────────────────────────────────────────

    it('saves referral code to localStorage from ?ref= param', () => {
        setWindowSearch('?ref=GHOSTFACTORY');
        renderHandler();
        expect(localStorage.getItem('referral_code')).toBe('GHOSTFACTORY');
    });

    it('does not set referral_code when no ref param', () => {
        setWindowSearch('?other=value');
        renderHandler();
        expect(localStorage.getItem('referral_code')).toBeNull();
    });

    // ── Payment success ────────────────────────────────────────────────────

    it('navigates to /store on payment success=true', () => {
        setWindowSearch('?success=true');
        renderHandler();
        expect(mockNavigate).toHaveBeenCalledWith('/store');
    });

    it('shows achievement toast after 1s on payment success', () => {
        setWindowSearch('?success=true');
        const setCurrentAchievement = vi.fn();
        renderHandler(setCurrentAchievement);

        expect(setCurrentAchievement).not.toHaveBeenCalled();

        act(() => vi.advanceTimersByTime(1000));

        expect(setCurrentAchievement).toHaveBeenCalledTimes(1);
        const ach = setCurrentAchievement.mock.calls[0][0];
        expect(ach.id).toBe('payment-success');
        expect(ach.icon).toBe('⚡');
        expect(ach.xp).toBe(0);
    });

    it('navigates to /store on success=false', () => {
        setWindowSearch('?success=false');
        renderHandler();
        expect(mockNavigate).toHaveBeenCalledWith('/store');
    });

    it('navigates to /store on canceled param', () => {
        setWindowSearch('?canceled=1');
        renderHandler();
        expect(mockNavigate).toHaveBeenCalledWith('/store');
    });

    it('does not navigate when no payment params', () => {
        setWindowSearch('');
        renderHandler();
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    // ── Legacy ?view= redirects ────────────────────────────────────────────

    const legacyViewRedirects: Array<[string, string, string?]> = [
        ['?view=book&id=abc-123', '/book/abc-123'],
        ['?view=card_studio', '/studio'],
        ['?view=library', '/library'],
        ['?view=arcade', '/arcade'],
        ['?view=discovery', '/encyclopedia'],
        ['?view=setup', '/create'],
        ['?view=create_custom', '/custom'],
        ['?view=profile', '/profile'],
        ['?view=energy_store', '/store'],
    ];

    it.each(legacyViewRedirects)('redirects "%s" to "%s"', (search, expectedPath) => {
        mockLocationSearch = search;
        renderHandler();

        expect(mockNavigate).toHaveBeenCalledWith(expectedPath, { replace: true });
    });

    it('does not redirect when view param is unknown', () => {
        mockLocationSearch = '?view=unknown_view';
        renderHandler();
        // mockNavigate may have been called for payment params only — not for view
        const viewRedirectCalls = mockNavigate.mock.calls.filter(
            ([path]) => typeof path === 'string' && path !== '/store'
        );
        expect(viewRedirectCalls.length).toBe(0);
    });

    it('does not redirect when no view param in location.search', () => {
        mockLocationSearch = '';
        setWindowSearch('');
        renderHandler();
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    // ── view=book edge cases ───────────────────────────────────────────────

    it('does not redirect view=book when id param is missing', () => {
        mockLocationSearch = '?view=book';
        renderHandler();

        // Should not navigate to /book/undefined
        const bookCalls = mockNavigate.mock.calls.filter(
            ([path]) => typeof path === 'string' && path.startsWith('/book/')
        );
        expect(bookCalls.length).toBe(0);
    });

    // ── Combined params ────────────────────────────────────────────────────

    it('handles ref + payment in same URL', () => {
        setWindowSearch('?ref=PARTNER123&success=true');
        renderHandler();

        expect(localStorage.getItem('referral_code')).toBe('PARTNER123');
        expect(mockNavigate).toHaveBeenCalledWith('/store');
    });

    // ── Re-render on location change ───────────────────────────────────────

    it('re-runs legacy redirect when location.search changes', () => {
        mockLocationSearch = '';
        const { rerender } = renderHandler();

        mockLocationSearch = '?view=library';
        rerender();

        expect(mockNavigate).toHaveBeenCalledWith('/library', { replace: true });
    });
});
