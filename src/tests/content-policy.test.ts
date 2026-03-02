import { describe, it, expect } from 'vitest';
import { checkTopicBlacklist, validateNickname, validateImageFile } from '../lib/content-policy';

// Helper to create a mock File
const makeFile = (name: string, type: string, sizeBytes: number): File => {
    const content = new Uint8Array(sizeBytes);
    return new File([content], name, { type });
};

describe('checkTopicBlacklist', () => {
    it('passes clean fairy-tale text', () => {
        expect(checkTopicBlacklist('Malý drak letěl nad zeleným lesem.')).toEqual({ blocked: false });
    });

    it('allows fairy-tale violence ("zabít draka")', () => {
        expect(checkTopicBlacklist('Rytíř musí zabít draka a zachránit princeznu.')).toEqual({ blocked: false });
    });

    it('blocks sexual content — porno', () => {
        const result = checkTopicBlacklist('pornografie');
        expect(result.blocked).toBe(true);
        expect(result.reason).toBeDefined();
    });

    it('blocks sexual content — erotika', () => {
        // Regex: \berotik\w* — matches "erotika", "erotický" doesn't match (has 'c' before 'k')
        expect(checkTopicBlacklist('erotika').blocked).toBe(true);
    });

    it('blocks sexual content — sex', () => {
        expect(checkTopicBlacklist('sex').blocked).toBe(true);
    });

    it('blocks self-harm — sebevražda', () => {
        expect(checkTopicBlacklist('sebevražda').blocked).toBe(true);
    });

    it('blocks self-harm — suicid', () => {
        expect(checkTopicBlacklist('suicidální myšlenky').blocked).toBe(true);
    });

    it('blocks drugs — kokain', () => {
        expect(checkTopicBlacklist('kokain').blocked).toBe(true);
    });

    it('blocks drugs — heroin', () => {
        // Regex uses \b word boundaries — exact form "heroin" (not declined "heroinu")
        expect(checkTopicBlacklist('heroin je smrtelný').blocked).toBe(true);
    });

    it('blocks occult — satan', () => {
        expect(checkTopicBlacklist('satanismus').blocked).toBe(true);
    });

    it('is case insensitive — PORNO', () => {
        expect(checkTopicBlacklist('PORNOGRAFIE').blocked).toBe(true);
    });

    it('passes text with multiple safe words', () => {
        expect(checkTopicBlacklist('Kouzelný les, hrdinný rytíř, zlatý drak, přátelství a odvaha.').blocked).toBe(false);
    });

    it('blocks content embedded in longer text', () => {
        // "kokain" as exact word (\bkokain\b) — declined forms like "kokainové" are not matched
        expect(checkTopicBlacklist('Tento příběh je o kokainu a drogách... kokain je zakázán.').blocked).toBe(true);
    });
});

describe('validateNickname', () => {
    it('passes a valid nickname', () => {
        expect(validateNickname('DragonHero')).toEqual({ blocked: false });
    });

    it('passes nickname with spaces and dashes', () => {
        expect(validateNickname('malý hrdina').blocked).toBe(false);
    });

    it('blocks nickname shorter than 3 chars', () => {
        const result = validateNickname('AB');
        expect(result.blocked).toBe(true);
        expect(result.reason).toMatch(/3/);
    });

    it('blocks nickname longer than 30 chars', () => {
        const result = validateNickname('A'.repeat(31));
        expect(result.blocked).toBe(true);
        expect(result.reason).toMatch(/30/);
    });

    it('blocks nickname with forbidden characters', () => {
        expect(validateNickname('user<script>').blocked).toBe(true);
    });

    it('blocks nickname containing blacklisted word', () => {
        expect(validateNickname('satanking').blocked).toBe(true);
    });
});

describe('validateImageFile', () => {
    it('passes valid JPEG under 5MB', () => {
        const file = makeFile('photo.jpg', 'image/jpeg', 1 * 1024 * 1024);
        expect(validateImageFile(file)).toEqual({ blocked: false });
    });

    it('passes valid PNG under 5MB', () => {
        const file = makeFile('image.png', 'image/png', 2 * 1024 * 1024);
        expect(validateImageFile(file)).toEqual({ blocked: false });
    });

    it('passes valid WEBP under 5MB', () => {
        const file = makeFile('image.webp', 'image/webp', 500_000);
        expect(validateImageFile(file)).toEqual({ blocked: false });
    });

    it('blocks PDF file', () => {
        const file = makeFile('doc.pdf', 'application/pdf', 100_000);
        const result = validateImageFile(file);
        expect(result.blocked).toBe(true);
        expect(result.reason).toBeDefined();
    });

    it('blocks file over 5MB', () => {
        const file = makeFile('big.jpg', 'image/jpeg', 6 * 1024 * 1024);
        const result = validateImageFile(file);
        expect(result.blocked).toBe(true);
        expect(result.reason).toMatch(/5 MB/);
    });

    it('blocks file exactly at 5MB + 1 byte', () => {
        const file = makeFile('edge.jpg', 'image/jpeg', 5 * 1024 * 1024 + 1);
        expect(validateImageFile(file).blocked).toBe(true);
    });

    it('passes file at exactly 5MB', () => {
        const file = makeFile('exact.jpg', 'image/jpeg', 5 * 1024 * 1024);
        expect(validateImageFile(file).blocked).toBe(false);
    });
});
