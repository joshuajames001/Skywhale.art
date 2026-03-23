import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateCompleteStory } from '../../../lib/ai/orchestrator';
import type { StoryParams } from '../../../lib/storyteller';
import type { StoryPage } from '../../../types';

// ─── Dependency mocks ─────────────────────────────────────────────────────
const mockGenerateStoryStructure = vi.fn();
const mockGenerateImage = vi.fn();

vi.mock('../../../lib/storyteller', () => ({
    generateStoryStructure: (...args: any[]) => mockGenerateStoryStructure(...args),
}));

vi.mock('../../../lib/ai', () => ({
    generateImage: (...args: any[]) => mockGenerateImage(...args),
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────
const BASE_PARAMS: StoryParams = {
    title: 'Příběh o velrybě',
    author: 'Jiří',
    main_character: 'Modrá velryba jménem Luna',
    setting: 'Hluboký oceán',
    target_audience: '4-8 let',
    visual_style: 'Watercolor',
    length: 3,
};

const makePage = (n: number): StoryPage => ({
    page_number: n,
    text: `Strana ${n}`,
    art_prompt: `Art prompt for page ${n}`,
    image_url: null,
    is_generated: false,
} as unknown as StoryPage);

const STRUCTURE_RESULT = {
    pages: [makePage(1), makePage(2), makePage(3)],
    coverPrompt: 'Krásná velryba na moři',
    identityPrompt: 'Modrá velryba Luna s velkýma očima',
    visualDna: 'A blue whale named Luna with big expressive eyes, playful fins',
};

// ─── Setup ────────────────────────────────────────────────────────────────
beforeEach(() => {
    vi.clearAllMocks();
    // Default happy path
    mockGenerateStoryStructure.mockResolvedValue(STRUCTURE_RESULT);
    mockGenerateImage
        .mockResolvedValueOnce({ url: 'https://cdn.skywhale.art/dna-portrait.png' })  // Phase 2: DNA
        .mockResolvedValueOnce({ url: 'https://cdn.skywhale.art/cover.png' });         // Phase 3: cover
});

// ─── Tests ────────────────────────────────────────────────────────────────
describe('generateCompleteStory', () => {

    // ── Returns a valid StoryBook ──────────────────────────────────────────

    it('returns a StoryBook with correct metadata from params', async () => {
        const book = await generateCompleteStory(BASE_PARAMS);

        expect(book.title).toBe('Příběh o velrybě');
        expect(book.author).toBe('Jiří');
        expect(book.main_character).toBe('Modrá velryba jménem Luna');
        expect(book.setting).toBe('Hluboký oceán');
        expect(book.visual_style).toBe('Watercolor');
    });

    it('assigns a UUID as book_id', async () => {
        const book = await generateCompleteStory(BASE_PARAMS);
        expect(book.book_id).toMatch(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
        );
    });

    it('tier is always "premium"', async () => {
        const book = await generateCompleteStory(BASE_PARAMS);
        expect((book as any).tier).toBe('premium');
    });

    // ── Phase 1: Structure ─────────────────────────────────────────────────

    it('calls generateStoryStructure with correct params', async () => {
        await generateCompleteStory(BASE_PARAMS);
        expect(mockGenerateStoryStructure).toHaveBeenCalledTimes(1);
        expect(mockGenerateStoryStructure).toHaveBeenCalledWith(BASE_PARAMS);
    });

    it('propagates error from generateStoryStructure', async () => {
        mockGenerateStoryStructure.mockRejectedValue(new Error('Edge function timeout'));
        await expect(generateCompleteStory(BASE_PARAMS)).rejects.toThrow('Edge function timeout');
    });

    // ── Phase 2: Visual DNA ────────────────────────────────────────────────

    it('generates hero portrait when identityPrompt is present', async () => {
        await generateCompleteStory(BASE_PARAMS);

        const dnaCall = mockGenerateImage.mock.calls[0][0];
        expect(dnaCall.tier).toBe('basic');
        expect(dnaCall.isCover).toBe(true);
        expect(dnaCall.steps).toBe(28);
        expect(dnaCall.style).toBe('Watercolor');
    });

    it('DNA prompt is a cinematic portrait, not a character sheet', async () => {
        await generateCompleteStory(BASE_PARAMS);
        const dnaCall = mockGenerateImage.mock.calls[0][0];
        expect(dnaCall.prompt).toContain('cinematic portrait');
        expect(dnaCall.prompt).not.toMatch(/blueprint|schematic|character sheet/i);
    });

    it('strips blueprint/schematic keywords from visualDna in DNA prompt', async () => {
        mockGenerateStoryStructure.mockResolvedValue({
            ...STRUCTURE_RESULT,
            visualDna: 'A brave knight, blueprint schematic turnaround, front view',
        });

        await generateCompleteStory(BASE_PARAMS);

        const dnaCall = mockGenerateImage.mock.calls[0][0];
        expect(dnaCall.characterDescription).not.toMatch(/blueprint|schematic|turnaround|front view/i);
    });

    it('skips DNA generation when identityPrompt is empty/falsy', async () => {
        mockGenerateStoryStructure.mockResolvedValue({
            ...STRUCTURE_RESULT,
            identityPrompt: '',
        });
        // Only cover call remains
        mockGenerateImage.mockReset();
        mockGenerateImage.mockResolvedValueOnce({ url: 'https://cdn.skywhale.art/cover.png' });

        const book = await generateCompleteStory(BASE_PARAMS);

        // generateImage called only once (cover), not twice
        expect(mockGenerateImage).toHaveBeenCalledTimes(1);
        // character_sheet_url comes from coverUrl since no DNA
        expect((book as any).character_sheet_url).toBe('https://cdn.skywhale.art/cover.png');
    });

    it('continues gracefully when DNA generation throws (non-fatal)', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        mockGenerateImage
            .mockRejectedValueOnce(new Error('Flux timeout'))   // DNA fails
            .mockResolvedValueOnce({ url: 'https://cdn.skywhale.art/cover.png' }); // Cover ok

        const book = await generateCompleteStory(BASE_PARAMS);

        expect(book.cover_image).toBe('https://cdn.skywhale.art/cover.png');
        consoleSpy.mockRestore();
    });

    // ── Phase 3: Cover ────────────────────────────────────────────────────

    it('generates cover with pro tier and vertical aspect ratio', async () => {
        await generateCompleteStory(BASE_PARAMS);

        const coverCall = mockGenerateImage.mock.calls[1][0];
        expect(coverCall.tier).toBe('pro');
        expect(coverCall.aspectRatio).toBe('vertical');
        expect(coverCall.isCover).toBe(true);
        expect(coverCall.steps).toBe(28);
    });

    it('passes characterSheetUrl as characterReference to cover', async () => {
        await generateCompleteStory(BASE_PARAMS);

        const coverCall = mockGenerateImage.mock.calls[1][0];
        expect(coverCall.characterReference).toBe('https://cdn.skywhale.art/dna-portrait.png');
    });

    it('sets book.cover_image to cover URL', async () => {
        const book = await generateCompleteStory(BASE_PARAMS);
        expect(book.cover_image).toBe('https://cdn.skywhale.art/cover.png');
    });

    it('sets cover_image=null when cover generation fails', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        mockGenerateImage.mockReset();
        mockGenerateImage
            .mockResolvedValueOnce({ url: 'https://cdn.skywhale.art/dna.png' }) // DNA ok
            .mockRejectedValueOnce(new Error('Cover failed'));                   // Cover fails

        const book = await generateCompleteStory(BASE_PARAMS);

        expect(book.cover_image).toBeNull();
        consoleSpy.mockRestore();
    });

    it('skips cover generation when coverPrompt is empty', async () => {
        mockGenerateStoryStructure.mockResolvedValue({
            ...STRUCTURE_RESULT,
            coverPrompt: '',
        });
        // Reset — only DNA call remains
        mockGenerateImage.mockReset();
        mockGenerateImage.mockResolvedValueOnce({ url: 'https://cdn.skywhale.art/dna.png' });

        const book = await generateCompleteStory(BASE_PARAMS);

        expect(mockGenerateImage).toHaveBeenCalledTimes(1);
        expect(book.cover_image).toBeNull();
    });

    // ── Reference URL chain (DNA → Cover → Pages) ─────────────────────────

    it('uses cover URL as character_sheet_url for pages when cover exists', async () => {
        const book = await generateCompleteStory(BASE_PARAMS);
        expect((book as any).character_sheet_url).toBe('https://cdn.skywhale.art/cover.png');
    });

    it('falls back to DNA URL as character_sheet_url when cover fails', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        mockGenerateImage.mockReset();
        mockGenerateImage
            .mockResolvedValueOnce({ url: 'https://cdn.skywhale.art/dna.png' })
            .mockRejectedValueOnce(new Error('Cover failed'));

        const book = await generateCompleteStory(BASE_PARAMS);

        expect((book as any).character_sheet_url).toBe('https://cdn.skywhale.art/dna.png');
        consoleSpy.mockRestore();
    });

    it('character_sheet_url is undefined when both DNA and cover fail', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        mockGenerateImage.mockReset();
        mockGenerateImage
            .mockRejectedValueOnce(new Error('DNA fail'))
            .mockRejectedValueOnce(new Error('Cover fail'));

        const book = await generateCompleteStory(BASE_PARAMS);

        expect((book as any).character_sheet_url).toBeFalsy();
        consoleSpy.mockRestore();
    });

    // ── Pages output ───────────────────────────────────────────────────────

    it('returns pages with image_url=null (lazy generation)', async () => {
        const book = await generateCompleteStory(BASE_PARAMS);
        book.pages.forEach(p => {
            expect(p.image_url).toBeNull();
        });
    });

    it('injects character_sheet_url into every page', async () => {
        mockGenerateImage.mockReset();
        mockGenerateImage
            .mockResolvedValueOnce({ url: 'https://cdn.skywhale.art/dna-portrait.png' })
            .mockResolvedValueOnce({ url: 'https://cdn.skywhale.art/cover.png' });

        const book = await generateCompleteStory(BASE_PARAMS);

        // pagesReferenceUrl = coverUrl (cover wins over DNA)
        // finalPages spreads character_sheet_url onto each page
        book.pages.forEach(p => {
            expect((p as any).character_sheet_url).toBe('https://cdn.skywhale.art/cover.png');
        });
    });

    it('all pages have is_generated=false', async () => {
        const book = await generateCompleteStory(BASE_PARAMS);
        book.pages.forEach(p => {
            expect(p.is_generated).toBe(false);
        });
    });

    it('respects params.length to slice pages', async () => {
        const book = await generateCompleteStory({ ...BASE_PARAMS, length: 2 });
        expect(book.pages).toHaveLength(2);
    });

    it('uses all pages when params.length exceeds structure pages', async () => {
        const book = await generateCompleteStory({ ...BASE_PARAMS, length: 99 });
        expect(book.pages).toHaveLength(STRUCTURE_RESULT.pages.length);
    });

    it('uses structure page count when params.length is undefined', async () => {
        const book = await generateCompleteStory({ ...BASE_PARAMS, length: undefined });
        expect(book.pages).toHaveLength(STRUCTURE_RESULT.pages.length);
    });

    // ── onProgress callback ────────────────────────────────────────────────

    it('calls onProgress with phase messages', async () => {
        const onProgress = vi.fn();
        await generateCompleteStory(BASE_PARAMS, onProgress);

        expect(onProgress).toHaveBeenCalledWith(expect.stringContaining('Dreaming'));
        expect(onProgress).toHaveBeenCalledWith(expect.stringContaining('Visual DNA'));
        expect(onProgress).toHaveBeenCalledWith(expect.stringContaining('Cover'));
    });

    it('works fine without onProgress callback', async () => {
        await expect(generateCompleteStory(BASE_PARAMS)).resolves.toBeDefined();
    });

    it('does not call DNA/Cover progress when identityPrompt empty and coverPrompt empty', async () => {
        mockGenerateStoryStructure.mockResolvedValue({
            ...STRUCTURE_RESULT,
            identityPrompt: '',
            coverPrompt: '',
        });
        mockGenerateImage.mockReset();

        const onProgress = vi.fn();
        await generateCompleteStory(BASE_PARAMS, onProgress);

        expect(onProgress).not.toHaveBeenCalledWith(expect.stringContaining('Visual DNA'));
        expect(onProgress).not.toHaveBeenCalledWith(expect.stringContaining('Cover'));
    });

    // ── Default title fallback ─────────────────────────────────────────────

    it('uses "New Story" when params.title is empty', async () => {
        const book = await generateCompleteStory({ ...BASE_PARAMS, title: '' });
        expect(book.title).toBe('New Story');
    });

    // ── cover_prompt and identity_prompt stored ────────────────────────────

    it('stores cover_prompt on the book', async () => {
        const book = await generateCompleteStory(BASE_PARAMS);
        expect((book as any).cover_prompt).toBe('Krásná velryba na moři');
    });

    it('stores identity_prompt on the book', async () => {
        const book = await generateCompleteStory(BASE_PARAMS);
        expect((book as any).identity_prompt).toBe('Modrá velryba Luna s velkýma očima');
    });

    it('stores visual_dna on the book', async () => {
        const book = await generateCompleteStory(BASE_PARAMS);
        expect((book as any).visual_dna).toBe(STRUCTURE_RESULT.visualDna);
    });
});
