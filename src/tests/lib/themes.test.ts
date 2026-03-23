import { describe, it, expect } from 'vitest';
import { THEMES, DEFAULT_THEME, getTheme } from '../../lib/themes';

describe('THEMES', () => {
    it('has 8 theme entries', () => {
        expect(Object.keys(THEMES)).toHaveLength(8);
    });

    it('contains all expected theme IDs', () => {
        const ids = ['Fantasy', 'Adventure', 'Bedtime', 'Sci-Fi', 'Watercolor', 'Pixar 3D', 'Futuristic', 'Sketch'];
        ids.forEach(id => expect(THEMES).toHaveProperty(id));
    });

    it.each(Object.keys(THEMES))('%s has all required fields', (themeId) => {
        const theme = THEMES[themeId];
        expect(theme.id).toBe(themeId);
        expect(theme.label).toBeTruthy();
        expect(theme.bgGradient).toBeTruthy();
        expect(theme.accentColor).toMatch(/^#/);
        expect(theme.glowColor).toMatch(/^#/);
        expect(theme.nebulaColors).toHaveProperty('aurora1');
        expect(theme.nebulaColors).toHaveProperty('aurora2');
        expect(theme.nebulaColors).toHaveProperty('dust');
        expect(['nebula', 'aurora', 'clean', 'digital']).toContain(theme.variant);
    });
});

describe('DEFAULT_THEME', () => {
    it('is Fantasy', () => {
        expect(DEFAULT_THEME.id).toBe('Fantasy');
    });
});

describe('getTheme', () => {
    it('returns matching theme for known style', () => {
        expect(getTheme('Adventure').id).toBe('Adventure');
        expect(getTheme('Sci-Fi').id).toBe('Sci-Fi');
    });

    it('returns Fantasy for unknown style', () => {
        expect(getTheme('NonExistent').id).toBe('Fantasy');
    });

    it('returns Fantasy for undefined', () => {
        expect(getTheme(undefined).id).toBe('Fantasy');
    });

    it('returns Fantasy for empty string', () => {
        expect(getTheme('').id).toBe('Fantasy');
    });
});
