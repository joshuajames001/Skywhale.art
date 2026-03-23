import { describe, it, expect, vi, beforeEach } from 'vitest';
import { invokeEdgeFunction } from '../../lib/edge-functions';

// ─── Mocks ───────────────────────────────────────────────────────────────
const mockGetSession = vi.fn();
const mockRefreshSession = vi.fn();

vi.mock('../../lib/supabase', () => ({
    supabase: {
        auth: {
            getSession: (...args: any[]) => mockGetSession(...args),
            refreshSession: (...args: any[]) => mockRefreshSession(...args),
        },
    },
}));

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// ─── Helpers ─────────────────────────────────────────────────────────────
const makeSession = (overrides?: any) => ({
    access_token: 'test-token',
    expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    ...overrides,
});

describe('invokeEdgeFunction', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns data on successful call', async () => {
        mockGetSession.mockResolvedValue({ data: { session: makeSession() }, error: null });
        mockFetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ result: 'success' }),
        });

        const { data, error } = await invokeEdgeFunction('test-fn', { foo: 'bar' });

        expect(data).toEqual({ result: 'success' });
        expect(error).toBeNull();
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('/functions/v1/test-fn'),
            expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                    'Authorization': 'Bearer test-token',
                }),
            })
        );
    });

    it('returns auth error when no session', async () => {
        mockGetSession.mockResolvedValue({ data: { session: null }, error: null });

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const { data, error } = await invokeEdgeFunction('test-fn', {});

        expect(data).toBeNull();
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toContain('Authentication required');
        consoleSpy.mockRestore();
    });

    it('refreshes token when near expiry', async () => {
        const nearExpiry = makeSession({ expires_at: Math.floor(Date.now() / 1000) + 60 }); // 60s left
        mockGetSession.mockResolvedValue({ data: { session: nearExpiry }, error: null });
        mockRefreshSession.mockResolvedValue({
            data: { session: { ...nearExpiry, access_token: 'refreshed-token' } },
            error: null,
        });
        mockFetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ ok: true }),
        });

        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        await invokeEdgeFunction('test-fn', {});

        expect(mockRefreshSession).toHaveBeenCalled();
        expect(mockFetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                headers: expect.objectContaining({
                    'Authorization': 'Bearer refreshed-token',
                }),
            })
        );
        consoleSpy.mockRestore();
    });

    it('returns error when refresh fails', async () => {
        const nearExpiry = makeSession({ expires_at: Math.floor(Date.now() / 1000) + 60 });
        mockGetSession.mockResolvedValue({ data: { session: nearExpiry }, error: null });
        mockRefreshSession.mockResolvedValue({ data: { session: null }, error: new Error('Refresh failed') });

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.spyOn(console, 'log').mockImplementation(() => {});
        const { data, error } = await invokeEdgeFunction('test-fn', {});

        expect(data).toBeNull();
        expect(error.message).toContain('refresh failed');
        consoleSpy.mockRestore();
    });

    it('returns error on HTTP failure with JSON body', async () => {
        mockGetSession.mockResolvedValue({ data: { session: makeSession() }, error: null });
        mockFetch.mockResolvedValue({
            ok: false,
            status: 500,
            json: () => Promise.resolve({ error: 'Internal error' }),
        });

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.spyOn(console, 'log').mockImplementation(() => {});
        const { data, error } = await invokeEdgeFunction('test-fn', {});

        expect(data).toBeNull();
        expect(error.message).toContain('Internal error');
        consoleSpy.mockRestore();
    });

    it('returns error on network failure', async () => {
        mockGetSession.mockResolvedValue({ data: { session: makeSession() }, error: null });
        mockFetch.mockRejectedValue(new Error('Network offline'));

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.spyOn(console, 'log').mockImplementation(() => {});
        const { data, error } = await invokeEdgeFunction('test-fn', {});

        expect(data).toBeNull();
        expect(error.message).toBe('Network offline');
        consoleSpy.mockRestore();
    });
});
