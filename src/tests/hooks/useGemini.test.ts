import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useGemini } from '../../hooks/useGemini';

// ─── Mock ────────────────────────────────────────────────────────────────
const mockInvokeEdgeFunction = vi.fn();

vi.mock('../../lib/edge-functions', () => ({
    invokeEdgeFunction: (...args: any[]) => mockInvokeEdgeFunction(...args),
}));

// ─── Helpers ─────────────────────────────────────────────────────────────
const makeChoicesResponse = (content: string) => ({
    data: { choices: [{ message: { content } }] },
    error: null,
});

describe('useGemini', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // ── generateSuggestion ───────────────────────────────────────────────

    describe('generateSuggestion', () => {
        it('returns parsed content on success', async () => {
            mockInvokeEdgeFunction.mockResolvedValue(makeChoicesResponse('  Next paragraph idea  '));

            const { result } = renderHook(() => useGemini());
            let suggestion: any;

            await act(async () => {
                suggestion = await result.current.generateSuggestion('story so far', 'current text', 0, 5);
            });

            expect(suggestion).toBe('Next paragraph idea');
            expect(mockInvokeEdgeFunction).toHaveBeenCalledWith('book-editor-assist', {
                action: 'generate-suggestion',
                payload: { storySoFar: 'story so far', currentText: 'current text', pageIndex: 0, totalPages: 5 },
            });
        });

        it('returns null and sets error on failure', async () => {
            mockInvokeEdgeFunction.mockResolvedValue({ data: null, error: new Error('AI timeout') });

            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const { result } = renderHook(() => useGemini());
            let suggestion: any;

            await act(async () => {
                suggestion = await result.current.generateSuggestion('', '', 0, 1);
            });

            expect(suggestion).toBeNull();
            expect(result.current.error).toBeTruthy();
            consoleSpy.mockRestore();
        });

        it('handles direct string response', async () => {
            mockInvokeEdgeFunction.mockResolvedValue({ data: 'Direct string response', error: null });

            const { result } = renderHook(() => useGemini());
            let suggestion: any;

            await act(async () => {
                suggestion = await result.current.generateSuggestion('', '', 0, 1);
            });

            expect(suggestion).toBe('Direct string response');
        });
    });

    // ── generateImagePrompt ──────────────────────────────────────────────

    describe('generateImagePrompt', () => {
        it('returns prompt string on success', async () => {
            mockInvokeEdgeFunction.mockResolvedValue(makeChoicesResponse('  A whale swimming in ocean  '));

            const { result } = renderHook(() => useGemini());
            let prompt: any;

            await act(async () => {
                prompt = await result.current.generateImagePrompt('Story about a whale');
            });

            expect(prompt).toBe('A whale swimming in ocean');
        });

        it('returns null on failure', async () => {
            mockInvokeEdgeFunction.mockResolvedValue({ data: null, error: new Error('fail') });

            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const { result } = renderHook(() => useGemini());
            let prompt: any;

            await act(async () => {
                prompt = await result.current.generateImagePrompt('text');
            });

            expect(prompt).toBeNull();
            consoleSpy.mockRestore();
        });
    });

    // ── generateInitialIdeas ─────────────────────────────────────────────

    describe('generateInitialIdeas', () => {
        it('returns array of ideas split by semicolon', async () => {
            mockInvokeEdgeFunction.mockResolvedValue(
                makeChoicesResponse('Forest adventure; Moon trip; Magic cat')
            );

            const { result } = renderHook(() => useGemini());
            let ideas: any;

            await act(async () => {
                ideas = await result.current.generateInitialIdeas();
            });

            expect(ideas).toEqual(['Forest adventure', 'Moon trip', 'Magic cat']);
        });

        it('returns fallback array on error', async () => {
            mockInvokeEdgeFunction.mockResolvedValue({ data: null, error: new Error('fail') });

            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const { result } = renderHook(() => useGemini());
            let ideas: any;

            await act(async () => {
                ideas = await result.current.generateInitialIdeas();
            });

            expect(ideas).toHaveLength(3);
            expect(ideas[0]).toContain('Dobrodružství');
            consoleSpy.mockRestore();
        });
    });

    // ── searchDictionary ─────────────────────────────────────────────────

    describe('searchDictionary', () => {
        it('returns parsed JSON result', async () => {
            const dictResult = { term: 'les', translation: 'forest', synonyms: ['wood', 'grove'] };
            mockInvokeEdgeFunction.mockResolvedValue(
                makeChoicesResponse(JSON.stringify(dictResult))
            );

            const { result } = renderHook(() => useGemini());
            let dictData: any;

            await act(async () => {
                dictData = await result.current.searchDictionary('les');
            });

            expect(dictData).toEqual(dictResult);
        });

        it('returns null on error', async () => {
            mockInvokeEdgeFunction.mockResolvedValue({ data: null, error: new Error('fail') });

            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const { result } = renderHook(() => useGemini());
            let dictData: any;

            await act(async () => {
                dictData = await result.current.searchDictionary('test');
            });

            expect(dictData).toBeNull();
            consoleSpy.mockRestore();
        });
    });

    // ── loading state ────────────────────────────────────────────────────

    it('sets loading=false after operation completes', async () => {
        mockInvokeEdgeFunction.mockResolvedValue(makeChoicesResponse('result'));

        const { result } = renderHook(() => useGemini());

        await act(async () => {
            await result.current.generateSuggestion('', '', 0, 1);
        });

        expect(result.current.loading).toBe(false);
    });
});
