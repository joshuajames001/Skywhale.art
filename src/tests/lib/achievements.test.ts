import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    checkAndUnlockAchievement,
    checkBookCountAchievements,
    checkCustomBookAchievements,
} from '../../lib/achievements';

// ─── Mock helpers ────────────────────────────────────────────────────────
// We need a chainable mock that supports:
//   .from(table).select(...).eq(col, val).eq(col2, val2).single()  → for checkAndUnlockAchievement
//   .from(table).select('*', { count, head }).eq(col, val)         → for count queries (awaited directly)
//   .from(table).insert(data)                                       → for unlock insert

const mockResults: Array<{ data?: any; count?: number; error?: any }> = [];
let resultIndex = 0;

const mockInsert = vi.fn();

const makeChainable = () => {
    const chain: any = {
        select: () => chain,
        eq: () => chain,
        neq: () => chain,
        single: () => Promise.resolve(mockResults[resultIndex++] || { data: null }),
        insert: (data: any) => mockInsert(data),
        // Make the chain itself thenable for count queries (no .single())
        then: (resolve: any, reject?: any) => {
            const result = mockResults[resultIndex++] || { data: null, count: 0 };
            return Promise.resolve(result).then(resolve, reject);
        },
    };
    return chain;
};

vi.mock('../../lib/supabase', () => ({
    supabase: {
        from: () => makeChainable(),
    },
}));

// ─── Fixtures ────────────────────────────────────────────────────────────
const ACHIEVEMENT = {
    id: 'first_book',
    title: 'First Book',
    description: 'Created your first book',
    icon: '📖',
    energy_reward: 100,
};

// ─── Tests ───────────────────────────────────────────────────────────────
describe('checkAndUnlockAchievement', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockResults.length = 0;
        resultIndex = 0;
    });

    it('returns null if achievement is already unlocked', async () => {
        mockResults.push({ data: { unlocked_at: '2025-01-01' } });

        const result = await checkAndUnlockAchievement('user-1', 'first_book');
        expect(result).toBeNull();
        expect(mockInsert).not.toHaveBeenCalled();
    });

    it('returns null if achievement does not exist in DB', async () => {
        mockResults.push({ data: null }); // not unlocked
        mockResults.push({ data: null }); // achievement not found

        const result = await checkAndUnlockAchievement('user-1', 'nonexistent');
        expect(result).toBeNull();
        expect(mockInsert).not.toHaveBeenCalled();
    });

    it('unlocks achievement and returns data on success', async () => {
        mockResults.push({ data: null }); // not unlocked
        mockResults.push({ data: ACHIEVEMENT }); // achievement found
        mockInsert.mockResolvedValueOnce({ error: null });

        const result = await checkAndUnlockAchievement('user-1', 'first_book');

        expect(result).toEqual(ACHIEVEMENT);
        expect(mockInsert).toHaveBeenCalledWith({
            user_id: 'user-1',
            achievement_id: 'first_book',
            unlocked_at: expect.any(String),
        });
    });

    it('returns null when insert throws', async () => {
        mockResults.push({ data: null });
        mockResults.push({ data: ACHIEVEMENT });
        mockInsert.mockResolvedValueOnce({ error: { message: 'RLS denied' } });

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const result = await checkAndUnlockAchievement('user-1', 'first_book');

        expect(result).toBeNull();
        consoleSpy.mockRestore();
    });
});

describe('checkBookCountAchievements', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockResults.length = 0;
        resultIndex = 0;
    });

    it('returns empty array when user has 0 books', async () => {
        // Count query resolves via thenable with count: 0
        mockResults.push({ count: 0 });

        const result = await checkBookCountAchievements('user-1');
        expect(result).toEqual([]);
    });

    it('triggers first_book when count >= 1', async () => {
        // Count query
        mockResults.push({ count: 1 });
        // checkAndUnlockAchievement('first_book'): already unlocked → null
        mockResults.push({ data: { unlocked_at: '2025-01-01' } });

        const result = await checkBookCountAchievements('user-1');
        expect(result).toEqual([]);
    });

    it('triggers multiple milestones when count >= 5', async () => {
        // Count = 5 → triggers first_book + beginner_writer
        mockResults.push({ count: 5 });
        // first_book: already unlocked
        mockResults.push({ data: { unlocked_at: '2025-01-01' } });
        // beginner_writer: not yet unlocked → unlock
        mockResults.push({ data: null }); // not unlocked
        mockResults.push({ data: { id: 'beginner_writer', title: 'Beginner Writer', description: 'Wrote 5 books', icon: '✍️' } });
        mockInsert.mockResolvedValueOnce({ error: null });

        const result = await checkBookCountAchievements('user-1');
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('beginner_writer');
    });
});

describe('checkCustomBookAchievements', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockResults.length = 0;
        resultIndex = 0;
    });

    it('returns empty array when user has 0 custom books', async () => {
        mockResults.push({ count: 0 });

        const result = await checkCustomBookAchievements('user-1');
        expect(result).toEqual([]);
    });

    it('triggers first_custom when count >= 1', async () => {
        mockResults.push({ count: 1 });
        // first_custom: not unlocked → unlock
        mockResults.push({ data: null });
        mockResults.push({ data: { id: 'first_custom', title: 'First Custom', description: 'Made a custom book', icon: '🎨' } });
        mockInsert.mockResolvedValueOnce({ error: null });

        const result = await checkCustomBookAchievements('user-1');
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('first_custom');
    });
});
