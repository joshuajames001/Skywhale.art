import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useDailyReward } from '../hooks/useDailyReward';

// Mock Supabase
const mockGetUser = vi.fn();
const mockSelect = vi.fn();
const mockRpc = vi.fn();

vi.mock('../lib/supabase', () => ({
    supabase: {
        auth: {
            getUser: (...args: any[]) => mockGetUser(...args)
        },
        from: () => ({
            select: (...args: any[]) => ({
                eq: (...args: any[]) => ({
                    single: mockSelect
                })
            }),
        }),
        rpc: (...args: any[]) => mockRpc(...args),
    }
}));

// Suppress window.location.reload in jsdom
Object.defineProperty(window, 'location', {
    value: { ...window.location, reload: vi.fn() },
    writable: true,
});

describe('useDailyReward', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should show reward if user is logged in and eligible', async () => {
        mockGetUser.mockResolvedValue({ data: { user: { id: 'test-user' } } });

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        mockSelect.mockResolvedValue({
            data: {
                last_claim_date: yesterday.toISOString(),
                claim_streak: 5,
            }
        });

        // RPC succeeds — reward granted
        mockRpc.mockResolvedValueOnce({ data: { success: true, reward: 10, streak: 6, balance: 110 }, error: null });

        const { result } = renderHook(() => useDailyReward());

        await waitFor(() => {
            expect(result.current.showDailyReward).toBe(true);
        });

        // Streak incremented during check (5 + 1 = 6)
        expect(result.current.rewardStreak).toBe(6);
        expect(mockRpc).toHaveBeenCalledWith('claim_daily_reward', { user_id: 'test-user', streak: 6 });
    });

    it('should NOT show reward if already claimed today', async () => {
        mockGetUser.mockResolvedValue({ data: { user: { id: 'test-user' } } });

        // Mock Profile (Today's claim)
        mockSelect.mockResolvedValue({
            data: {
                last_claim_date: new Date().toISOString(),
                claim_streak: 5,
            }
        });

        const { result } = renderHook(() => useDailyReward());

        // Wait a bit to ensure async check finishes (even if it does nothing)
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(result.current.showDailyReward).toBe(false);
        // RPC should NOT have been called — client-side check short-circuits
        expect(mockRpc).not.toHaveBeenCalled();
    });

    it('should reset streak if missed a day', async () => {
        mockGetUser.mockResolvedValue({ data: { user: { id: 'test-user' } } });

        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        mockSelect.mockResolvedValue({
            data: {
                last_claim_date: twoDaysAgo.toISOString(),
                claim_streak: 5,
            }
        });

        // RPC succeeds with reset streak (0 + 1 = 1)
        mockRpc.mockResolvedValueOnce({ data: { success: true, reward: 10, streak: 1, balance: 110 }, error: null });

        const { result } = renderHook(() => useDailyReward());

        await waitFor(() => {
            expect(result.current.showDailyReward).toBe(true);
        });

        expect(result.current.rewardStreak).toBe(1); // Reset to 0 then +1
        expect(mockRpc).toHaveBeenCalledWith('claim_daily_reward', { user_id: 'test-user', streak: 1 });
    });

    it('should show reward on first ever claim (no last_claim_date)', async () => {
        mockGetUser.mockResolvedValue({ data: { user: { id: 'test-user' } } });
        mockSelect.mockResolvedValue({
            data: { last_claim_date: null, claim_streak: 0 }
        });

        // RPC succeeds (streak 0 + 1 = 1)
        mockRpc.mockResolvedValueOnce({ data: { success: true, reward: 10, streak: 1, balance: 10 }, error: null });

        const { result } = renderHook(() => useDailyReward());

        await waitFor(() => {
            expect(result.current.showDailyReward).toBe(true);
        });

        expect(result.current.rewardStreak).toBe(1);
    });

    it('should NOT show reward if RPC returns already claimed', async () => {
        mockGetUser.mockResolvedValue({ data: { user: { id: 'test-user' } } });

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        mockSelect.mockResolvedValue({
            data: { last_claim_date: yesterday.toISOString(), claim_streak: 5 }
        });

        // RPC says already claimed (race condition — another tab claimed)
        mockRpc.mockResolvedValueOnce({ data: { success: false, message: 'Already claimed today' }, error: null });

        const { result } = renderHook(() => useDailyReward());

        await new Promise(resolve => setTimeout(resolve, 100));

        expect(result.current.showDailyReward).toBe(false);
    });

    it('handleClaimReward closes modal (reward already claimed during check)', async () => {
        mockGetUser.mockResolvedValue({ data: { user: { id: 'test-user' } } });

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        mockSelect.mockResolvedValue({
            data: { last_claim_date: yesterday.toISOString(), claim_streak: 6 }
        });

        // RPC succeeds during check — streak 7
        mockRpc.mockResolvedValueOnce({ data: { success: true, reward: 30, streak: 7, balance: 130 }, error: null });

        const { result } = renderHook(() => useDailyReward());

        await waitFor(() => expect(result.current.showDailyReward).toBe(true));
        expect(result.current.rewardStreak).toBe(7);

        // handleClaimReward just closes modal now
        await act(async () => {
            await result.current.handleClaimReward();
        });

        expect(result.current.showDailyReward).toBe(false);
    });

    it('RPC called with correct streak on day 7 cycle (streak 13 → 14)', async () => {
        mockGetUser.mockResolvedValue({ data: { user: { id: 'test-user' } } });

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        mockSelect.mockResolvedValue({
            data: { last_claim_date: yesterday.toISOString(), claim_streak: 13 }
        });

        mockRpc.mockResolvedValueOnce({ data: { success: true, reward: 30, streak: 14, balance: 230 }, error: null });

        const { result } = renderHook(() => useDailyReward());

        await waitFor(() => expect(result.current.showDailyReward).toBe(true));

        expect(mockRpc).toHaveBeenCalledWith('claim_daily_reward', { user_id: 'test-user', streak: 14 });
    });
});
