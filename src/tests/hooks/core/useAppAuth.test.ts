import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useAppAuth } from '../../../hooks/core/useAppAuth';

// ─── Supabase mock setup ───────────────────────────────────────────────────
const mockGetSession = vi.fn();
const mockOnAuthStateChange = vi.fn();
const mockUnsubscribe = vi.fn();
const mockProfileSingle = vi.fn();

vi.mock('../../../lib/supabase', () => ({
    supabase: {
        auth: {
            getSession: (...args: any[]) => mockGetSession(...args),
            onAuthStateChange: (...args: any[]) => mockOnAuthStateChange(...args),
        },
        from: () => ({
            select: () => ({
                eq: () => ({
                    single: () => mockProfileSingle(),
                }),
            }),
        }),
    },
}));

// ─── Helpers ──────────────────────────────────────────────────────────────
const makeUser = (id = 'user-abc') => ({ id, email: 'test@test.com' });

const setupMocks = (userId?: string) => {
    const session = userId ? { user: makeUser(userId) } : null;

    mockGetSession.mockResolvedValue({ data: { session } });
    mockOnAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: mockUnsubscribe } },
    });
};

// ─── Tests ────────────────────────────────────────────────────────────────
describe('useAppAuth', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Clear any auth error fragments
        window.location.hash = '';
    });

    // ── Initial state ──────────────────────────────────────────────────────

    it('starts with user=null and showAuth=false', () => {
        setupMocks();
        mockProfileSingle.mockResolvedValue({ data: null });

        const { result } = renderHook(() => useAppAuth());

        expect(result.current.user).toBeNull();
        expect(result.current.showAuth).toBe(false);
        expect(result.current.profile).toBeNull();
    });

    // ── Session loading ────────────────────────────────────────────────────

    it('sets user from existing session on mount', async () => {
        setupMocks('user-123');
        mockProfileSingle.mockResolvedValue({ data: null });

        const { result } = renderHook(() => useAppAuth());

        await waitFor(() => {
            expect(result.current.user?.id).toBe('user-123');
        });
    });

    it('keeps user=null when no active session', async () => {
        setupMocks(); // no user
        const { result } = renderHook(() => useAppAuth());

        await waitFor(() => {
            expect(result.current.user).toBeNull();
        });
    });

    // ── Profile fetch ──────────────────────────────────────────────────────

    it('fetches and sets profile when session exists', async () => {
        setupMocks('user-456');
        mockProfileSingle.mockResolvedValue({
            data: { nickname: 'Jiří', avatar_emoji: '🐳', energy_balance: 500, username: 'jiri' },
        });

        const { result } = renderHook(() => useAppAuth());

        await waitFor(() => {
            expect(result.current.profile?.nickname).toBe('Jiří');
            expect(result.current.profile?.id).toBe('user-456');
            expect(result.current.profile?.energy_balance).toBe(500);
        });
    });

    it('leaves profile=null when DB returns no data', async () => {
        setupMocks('user-789');
        mockProfileSingle.mockResolvedValue({ data: null });

        const { result } = renderHook(() => useAppAuth());

        await waitFor(() => {
            expect(result.current.user?.id).toBe('user-789');
        });
        expect(result.current.profile).toBeNull();
    });

    it('does not crash when profile fetch throws', async () => {
        setupMocks('user-err');
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        mockProfileSingle.mockRejectedValue(new Error('DB offline'));

        const { result } = renderHook(() => useAppAuth());

        await waitFor(() => {
            expect(result.current.user?.id).toBe('user-err');
        });
        expect(result.current.profile).toBeNull();
        consoleSpy.mockRestore();
    });

    // ── Auth state change ──────────────────────────────────────────────────

    it('updates user when onAuthStateChange fires with new session', async () => {
        setupMocks();
        mockProfileSingle.mockResolvedValue({ data: null });

        let authChangeCallback: (event: string, session: any) => void = () => {};
        mockOnAuthStateChange.mockImplementation((cb: any) => {
            authChangeCallback = cb;
            return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
        });

        const { result } = renderHook(() => useAppAuth());

        await waitFor(() => expect(result.current.user).toBeNull());

        // Simulate login
        act(() => {
            authChangeCallback('SIGNED_IN', { user: makeUser('user-new') });
        });

        await waitFor(() => {
            expect(result.current.user?.id).toBe('user-new');
        });
    });

    it('clears user and profile on sign-out event', async () => {
        setupMocks('user-signout');
        mockProfileSingle.mockResolvedValue({
            data: { nickname: 'Ghost', avatar_emoji: '👻', energy_balance: 100, username: 'ghost' },
        });

        let authChangeCallback: (event: string, session: any) => void = () => {};
        mockOnAuthStateChange.mockImplementation((cb: any) => {
            authChangeCallback = cb;
            return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
        });

        const { result } = renderHook(() => useAppAuth());

        await waitFor(() => expect(result.current.profile?.nickname).toBe('Ghost'));

        act(() => {
            authChangeCallback('SIGNED_OUT', null);
        });

        await waitFor(() => {
            expect(result.current.user).toBeNull();
            expect(result.current.profile).toBeNull();
        });
    });

    // ── showAuth toggle ────────────────────────────────────────────────────

    it('setShowAuth toggles modal state', async () => {
        setupMocks();
        mockProfileSingle.mockResolvedValue({ data: null });

        const { result } = renderHook(() => useAppAuth());

        // Wait for async getSession to settle so subsequent act() calls don't
        // trigger an "update not wrapped in act" warning from the pending promise.
        await waitFor(() => expect(mockGetSession).toHaveBeenCalled());

        expect(result.current.showAuth).toBe(false);

        act(() => result.current.setShowAuth(true));
        expect(result.current.showAuth).toBe(true);

        act(() => result.current.setShowAuth(false));
        expect(result.current.showAuth).toBe(false);
    });

    // ── refreshProfile ─────────────────────────────────────────────────────

    it('refreshProfile re-fetches profile when user is set', async () => {
        setupMocks('user-refresh');
        mockProfileSingle
            .mockResolvedValueOnce({ data: { nickname: 'Old', avatar_emoji: '🐙', energy_balance: 10, username: 'old' } })
            .mockResolvedValueOnce({ data: { nickname: 'New', avatar_emoji: '🐳', energy_balance: 99, username: 'new' } });

        const { result } = renderHook(() => useAppAuth());

        await waitFor(() => expect(result.current.profile?.nickname).toBe('Old'));

        act(() => { result.current.refreshProfile(); });

        await waitFor(() => {
            expect(result.current.profile?.nickname).toBe('New');
            expect(result.current.profile?.energy_balance).toBe(99);
        });
    });

    it('refreshProfile does nothing when user is null', async () => {
        setupMocks();
        const { result } = renderHook(() => useAppAuth());

        await waitFor(() => expect(result.current.user).toBeNull());

        act(() => { result.current.refreshProfile(); });

        // profileSingle should never have been called (no user)
        expect(mockProfileSingle).not.toHaveBeenCalled();
    });

    // ── Cleanup ────────────────────────────────────────────────────────────

    it('unsubscribes from auth listener on unmount', async () => {
        setupMocks();
        const { unmount } = renderHook(() => useAppAuth());

        await waitFor(() => expect(mockOnAuthStateChange).toHaveBeenCalled());

        unmount();
        expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
    });

    // ── Auth error fragment cleanup ────────────────────────────────────────

    it('clears error hash fragment on mount', async () => {
        window.location.hash = '#error=access_denied&error_description=something';
        setupMocks();
        mockProfileSingle.mockResolvedValue({ data: null });

        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        renderHook(() => useAppAuth());

        expect(window.location.hash).toBe('');
        consoleSpy.mockRestore();
    });

    it('does not touch hash when no error fragment', async () => {
        window.location.hash = '#section-1';
        setupMocks();
        mockProfileSingle.mockResolvedValue({ data: null });

        renderHook(() => useAppAuth());

        expect(window.location.hash).toBe('#section-1');
    });
});
