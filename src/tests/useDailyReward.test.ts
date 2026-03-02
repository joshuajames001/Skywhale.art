import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useDailyReward } from '../hooks/useDailyReward';

// Mock Supabase
const mockGetUser = vi.fn();
const mockSelect = vi.fn();
const mockUpdate = vi.fn();
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
            update: (...args: any[]) => ({
                eq: mockUpdate
            })
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
        // Mock User
        mockGetUser.mockResolvedValue({ data: { user: { id: 'test-user' } } });

        // Mock Profile (Yesterday's claim)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        mockSelect.mockResolvedValue({
            data: {
                last_claim_date: yesterday.toISOString(),
                claim_streak: 5,
                energy_balance: 100
            }
        });

        const { result } = renderHook(() => useDailyReward());

        await waitFor(() => {
            expect(result.current.showDailyReward).toBe(true);
        });

        expect(result.current.rewardStreak).toBe(5);
    });

    it('should NOT show reward if already claimed today', async () => {
        mockGetUser.mockResolvedValue({ data: { user: { id: 'test-user' } } });

        // Mock Profile (Today's claim)
        mockSelect.mockResolvedValue({
            data: {
                last_claim_date: new Date().toISOString(),
                claim_streak: 5,
                energy_balance: 100
            }
        });

        const { result } = renderHook(() => useDailyReward());

        // Wait a bit to ensure async check finishes (even if it does nothing)
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(result.current.showDailyReward).toBe(false);
    });

    it('should reset streak if missed a day', async () => {
        mockGetUser.mockResolvedValue({ data: { user: { id: 'test-user' } } });

        // Mock Profile (2 days ago)
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        mockSelect.mockResolvedValue({
            data: {
                last_claim_date: twoDaysAgo.toISOString(),
                claim_streak: 5, // Old streak
                energy_balance: 100
            }
        });

        const { result } = renderHook(() => useDailyReward());

        await waitFor(() => {
            expect(result.current.showDailyReward).toBe(true);
        });

        expect(result.current.rewardStreak).toBe(0); // Should be reset
    });

    it('should show reward on first ever claim (no last_claim_date)', async () => {
        mockGetUser.mockResolvedValue({ data: { user: { id: 'test-user' } } });
        mockSelect.mockResolvedValue({
            data: { last_claim_date: null, claim_streak: 0, energy_balance: 0 }
        });

        const { result } = renderHook(() => useDailyReward());

        await waitFor(() => {
            expect(result.current.showDailyReward).toBe(true);
        });

        expect(result.current.rewardStreak).toBe(0);
    });

    it('handleClaimReward calls RPC with incremented streak on normal day', async () => {
        mockGetUser.mockResolvedValue({ data: { user: { id: 'test-user' } } });

        // checkDailyReward — streak is 4
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        mockSelect
            .mockResolvedValueOnce({
                data: { last_claim_date: yesterday.toISOString(), claim_streak: 4, energy_balance: 100 }
            })
            // handleClaimReward re-fetches energy_balance
            .mockResolvedValueOnce({ data: { energy_balance: 100 } });

        mockRpc.mockResolvedValueOnce({ error: null });

        const { result } = renderHook(() => useDailyReward());

        await waitFor(() => expect(result.current.showDailyReward).toBe(true));

        await act(async () => {
            await result.current.handleClaimReward();
        });

        // Called with streak 5 (4 + 1)
        expect(mockRpc).toHaveBeenCalledWith('claim_daily_reward', { user_id: 'test-user', streak: 5 });
    });

    it('handleClaimReward: streak 6 → day 7 bonus (newStreak % 7 === 0)', async () => {
        mockGetUser.mockResolvedValue({ data: { user: { id: 'test-user' } } });

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        mockSelect
            .mockResolvedValueOnce({
                data: { last_claim_date: yesterday.toISOString(), claim_streak: 6, energy_balance: 100 }
            })
            .mockResolvedValueOnce({ data: { energy_balance: 100 } });

        mockRpc.mockResolvedValueOnce({ error: null });

        const { result } = renderHook(() => useDailyReward());

        await waitFor(() => expect(result.current.showDailyReward).toBe(true));

        await act(async () => {
            await result.current.handleClaimReward();
        });

        // streak 6 → newStreak = 7 → isDay7 = true
        expect(mockRpc).toHaveBeenCalledWith('claim_daily_reward', { user_id: 'test-user', streak: 7 });
        expect(result.current.rewardStreak).toBe(7);
    });

    it('handleClaimReward: streak 13 → day 7 cycle repeats (14 % 7 === 0)', async () => {
        mockGetUser.mockResolvedValue({ data: { user: { id: 'test-user' } } });

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        mockSelect
            .mockResolvedValueOnce({
                data: { last_claim_date: yesterday.toISOString(), claim_streak: 13, energy_balance: 200 }
            })
            .mockResolvedValueOnce({ data: { energy_balance: 200 } });

        mockRpc.mockResolvedValueOnce({ error: null });

        const { result } = renderHook(() => useDailyReward());

        await waitFor(() => expect(result.current.showDailyReward).toBe(true));

        await act(async () => {
            await result.current.handleClaimReward();
        });

        expect(mockRpc).toHaveBeenCalledWith('claim_daily_reward', { user_id: 'test-user', streak: 14 });
    });
});
