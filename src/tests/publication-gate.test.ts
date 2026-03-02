import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useLibraryAdapter } from '../providers/useLibraryAdapter';

// --- Mocks ---

const mockCheckTopicBlacklist = vi.fn();
const mockModerateContent = vi.fn();

vi.mock('../lib/content-policy', () => ({
    checkTopicBlacklist: (...args: any[]) => mockCheckTopicBlacklist(...args),
}));

vi.mock('../lib/moderation', () => ({
    moderateContent: (...args: any[]) => mockModerateContent(...args),
}));

// Supabase mock — supports books + pages queries
const mockBookSingle = vi.fn();
const mockPageMaybeSingle = vi.fn();
const mockBookUpdate = vi.fn();

vi.mock('../lib/supabase', () => ({
    supabase: {
        from: (table: string) => {
            if (table === 'books') {
                return {
                    select: () => ({ eq: () => ({ single: () => mockBookSingle() }) }),
                    update: () => ({ eq: () => ({ eq: () => mockBookUpdate() }) }),
                };
            }
            if (table === 'pages') {
                return {
                    select: () => ({
                        eq: () => ({
                            order: () => ({ limit: () => ({ maybeSingle: () => mockPageMaybeSingle() }) }),
                        }),
                    }),
                };
            }
            return {};
        },
    },
}));

// Helper: build adapter with stub callbacks
const makeAdapter = () => useLibraryAdapter({
    onOpenBook: vi.fn(),
    onOpenMagic: vi.fn(),
    onCreateCustom: vi.fn(),
});

describe('togglePublicStatus — publication gate', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('skips moderation when hiding a book (currentStatus: true → private)', async () => {
        mockBookUpdate.mockResolvedValue({ error: null });

        const { togglePublicStatus } = makeAdapter();
        const result = await togglePublicStatus('book-1', true, 'user-1');

        expect(mockCheckTopicBlacklist).not.toHaveBeenCalled();
        expect(mockModerateContent).not.toHaveBeenCalled();
        expect(result).toEqual({ success: true });
    });

    it('publishes book when content is clean', async () => {
        mockBookSingle.mockResolvedValue({ data: { title: 'Malý drak Flamík' } });
        mockPageMaybeSingle.mockResolvedValue({ data: { content: 'Jednoho rána se Flamík probudil v horách.' } });
        mockCheckTopicBlacklist.mockReturnValue({ blocked: false });
        mockModerateContent.mockResolvedValue({ flagged: false, categories: {} });
        mockBookUpdate.mockResolvedValue({ error: null });

        const { togglePublicStatus } = makeAdapter();
        const result = await togglePublicStatus('book-1', false, 'user-1');

        expect(result).toEqual({ success: true });
        expect(mockBookUpdate).toHaveBeenCalledOnce();
    });

    it('blocks publication when title contains blacklisted word', async () => {
        mockBookSingle.mockResolvedValue({ data: { title: 'Příběh o pornografii' } });
        mockPageMaybeSingle.mockResolvedValue({ data: { content: 'Čistý text.' } });
        mockCheckTopicBlacklist.mockReturnValue({
            blocked: true,
            reason: 'Tento obsah není vhodný pro dětskou platformu.',
        });

        const { togglePublicStatus } = makeAdapter();
        const result = await togglePublicStatus('book-1', false, 'user-1');

        expect(result.success).toBe(false);
        expect(result.blockedReason).toBeDefined();
        expect(mockModerateContent).not.toHaveBeenCalled();
        expect(mockBookUpdate).not.toHaveBeenCalled();
    });

    it('blocks publication when AI moderation flags content', async () => {
        mockBookSingle.mockResolvedValue({ data: { title: 'Neutrální název' } });
        mockPageMaybeSingle.mockResolvedValue({ data: { content: 'Problematický obsah.' } });
        mockCheckTopicBlacklist.mockReturnValue({ blocked: false });
        mockModerateContent.mockResolvedValue({
            flagged: true,
            categories: { violence: true },
            reason: 'Obsah obsahuje nevhodný obsah pro děti.',
        });

        const { togglePublicStatus } = makeAdapter();
        const result = await togglePublicStatus('book-1', false, 'user-1');

        expect(result.success).toBe(false);
        expect(result.blockedReason).toBeDefined();
        expect(mockBookUpdate).not.toHaveBeenCalled();
    });

    it('returns success:false when DB update fails (wrong owner)', async () => {
        mockBookSingle.mockResolvedValue({ data: { title: 'Čistá kniha' } });
        mockPageMaybeSingle.mockResolvedValue({ data: { content: 'Čistý text.' } });
        mockCheckTopicBlacklist.mockReturnValue({ blocked: false });
        mockModerateContent.mockResolvedValue({ flagged: false, categories: {} });
        mockBookUpdate.mockResolvedValue({ error: { message: 'Row not found' } });

        const { togglePublicStatus } = makeAdapter();
        const result = await togglePublicStatus('book-1', false, 'wrong-user');

        expect(result.success).toBe(false);
    });
});
