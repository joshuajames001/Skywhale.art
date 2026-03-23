import { describe, it, expect, vi, beforeEach } from 'vitest';
import { storageService } from '../../lib/storage-service';

// ─── Mocks ───────────────────────────────────────────────────────────────
const mockUpload = vi.fn();
const mockGetPublicUrl = vi.fn();

vi.mock('../../lib/supabase', () => ({
    supabase: {
        storage: {
            from: () => ({
                upload: (...args: any[]) => mockUpload(...args),
                getPublicUrl: (...args: any[]) => {
                    mockGetPublicUrl(...args);
                    return { data: { publicUrl: 'https://storage.test/story-assets/test.png' } };
                },
            }),
        },
    },
}));

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('storageService.uploadImageFromUrl', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('downloads image, uploads to storage, and returns public URL', async () => {
        const blob = new Blob(['fake-image'], { type: 'image/png' });
        mockFetch.mockResolvedValue({ blob: () => Promise.resolve(blob) });
        mockUpload.mockResolvedValue({ error: null });

        const url = await storageService.uploadImageFromUrl(
            'https://replicate.test/output.png',
            'covers/test.png'
        );

        expect(url).toBe('https://storage.test/story-assets/test.png');
        expect(mockFetch).toHaveBeenCalledWith('https://replicate.test/output.png');
        expect(mockUpload).toHaveBeenCalledWith('covers/test.png', blob, expect.objectContaining({ upsert: true }));
    });

    it('returns null when fetch fails', async () => {
        mockFetch.mockRejectedValue(new Error('Network error'));

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const url = await storageService.uploadImageFromUrl('https://bad.url/img.png', 'path.png');

        expect(url).toBeNull();
        consoleSpy.mockRestore();
    });

    it('returns null when upload fails', async () => {
        mockFetch.mockResolvedValue({ blob: () => Promise.resolve(new Blob()) });
        mockUpload.mockResolvedValue({ error: { message: 'Upload failed' } });

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const url = await storageService.uploadImageFromUrl('https://ok.url/img.png', 'path.png');

        expect(url).toBeNull();
        consoleSpy.mockRestore();
    });
});
