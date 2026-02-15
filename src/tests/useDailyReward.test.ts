import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDailyReward } from '../hooks/useDailyReward';

// Mock Supabase
const mockGetUser = vi.fn();
const mockSelect = vi.fn();
const mockUpdate = vi.fn();

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
        })
    }
}));

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
});
