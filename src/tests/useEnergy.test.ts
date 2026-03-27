import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useEnergy } from '../hooks/useEnergy';

const mockGetUser = vi.fn();
const mockSingle = vi.fn();
const mockRpc = vi.fn();
const mockSubscribe = vi.fn();

vi.mock('../lib/edge-functions', () => ({
    invokeEdgeFunction: vi.fn().mockResolvedValue({ data: null, error: null }),
}));

vi.mock('../lib/supabase', () => ({
    supabase: {
        auth: {
            getUser: (...args: any[]) => mockGetUser(...args),
            getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
        },
        from: () => ({
            select: () => ({
                eq: () => ({ single: () => mockSingle() }),
            }),
        }),
        channel: () => ({
            on: () => ({ subscribe: (...args: any[]) => mockSubscribe(...args) }),
        }),
        removeChannel: vi.fn(),
        rpc: (...args: any[]) => mockRpc(...args),
    },
}));

describe('useEnergy', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Default: no subscription claim needed
        mockSubscribe.mockReturnValue({});
    });

    it('sets balance from profile when user is logged in', async () => {
        mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
        // First call: energy_balance fetch; second call: subscription check
        mockSingle
            .mockResolvedValueOnce({ data: { energy_balance: 1500 } })
            .mockResolvedValueOnce({ data: { subscription_status: 'inactive', next_energy_grant: null } });

        const { result } = renderHook(() => useEnergy());

        await waitFor(() => {
            expect(result.current.balance).toBe(1500);
        });
    });

    it('sets balance to null when user is not logged in', async () => {
        mockGetUser.mockResolvedValue({ data: { user: null } });

        const { result } = renderHook(() => useEnergy());

        await waitFor(() => {
            expect(result.current.balance).toBeNull();
        });
    });

    it('does not crash when DB returns null data — balance stays 0', async () => {
        mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
        // Both select calls return no data (DB error scenario)
        mockSingle.mockResolvedValue({ data: null, error: { message: 'DB error' } });

        const { result } = renderHook(() => useEnergy());

        // balance should remain at initial null (setBalance never called with real data)
        await new Promise(resolve => setTimeout(resolve, 150));

        expect(result.current.balance).toBeNull();
    });

    it('refreshBalance updates balance correctly', async () => {
        mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
        mockSingle.mockResolvedValue({ data: { energy_balance: 500, subscription_status: 'inactive', next_energy_grant: null } });

        const { result } = renderHook(() => useEnergy());

        await waitFor(() => expect(result.current.balance).toBe(500));

        // Update mock to return new balance
        mockSingle.mockResolvedValue({ data: { energy_balance: 750, subscription_status: 'inactive', next_energy_grant: null } });
        await result.current.refreshBalance();

        await waitFor(() => expect(result.current.balance).toBe(750));
    });

    it('claims monthly energy when grant is overdue', async () => {
        mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });

        const pastDate = new Date();
        pastDate.setMonth(pastDate.getMonth() - 1);

        mockSingle
            .mockResolvedValueOnce({ data: { energy_balance: 1000 } })
            .mockResolvedValueOnce({ data: { subscription_status: 'active', next_energy_grant: pastDate.toISOString() } })
            .mockResolvedValueOnce({ data: { energy_balance: 6000 } }); // after claim

        mockRpc.mockResolvedValueOnce({ data: { success: true, amount: 5000 }, error: null });

        const { result } = renderHook(() => useEnergy());

        await waitFor(() => {
            expect(mockRpc).toHaveBeenCalledWith('claim_monthly_energy', { user_id: 'user-1' });
        });
    });

    it('does not claim monthly energy when grant date is in the future', async () => {
        mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });

        const futureDate = new Date();
        futureDate.setMonth(futureDate.getMonth() + 1);

        mockSingle
            .mockResolvedValueOnce({ data: { energy_balance: 1000 } })
            .mockResolvedValueOnce({ data: { subscription_status: 'active', next_energy_grant: futureDate.toISOString() } });

        renderHook(() => useEnergy());

        await new Promise(resolve => setTimeout(resolve, 150));

        expect(mockRpc).not.toHaveBeenCalled();
    });
});
