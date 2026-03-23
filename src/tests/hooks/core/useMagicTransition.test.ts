import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMagicTransition } from '../../../hooks/core/useMagicTransition';

// ─── React Router mock ─────────────────────────────────────────────────────
const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
}));

// ─── Tests ────────────────────────────────────────────────────────────────
describe('useMagicTransition', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    // ── Initial state ──────────────────────────────────────────────────────

    it('starts with all flags false', () => {
        const { result } = renderHook(() => useMagicTransition());

        expect(result.current.isTransitioning).toBe(false);
        expect(result.current.showFairy).toBe(false);
        expect(result.current.showFlash).toBe(false);
    });

    // ── triggerMagicTransition ─────────────────────────────────────────────

    it('sets isTransitioning=true and showFairy=true when triggered', () => {
        const { result } = renderHook(() => useMagicTransition());

        act(() => {
            result.current.triggerMagicTransition('setup');
        });

        expect(result.current.isTransitioning).toBe(true);
        expect(result.current.showFairy).toBe(true);
        expect(result.current.showFlash).toBe(false);
    });

    it('accepts any target view string without throwing', () => {
        const { result } = renderHook(() => useMagicTransition());

        expect(() => {
            act(() => result.current.triggerMagicTransition('any_random_view'));
        }).not.toThrow();
    });

    // ── handleFairyTrigger ─────────────────────────────────────────────────

    it('sets showFlash=true immediately when fairy triggers', () => {
        const { result } = renderHook(() => useMagicTransition());

        act(() => result.current.triggerMagicTransition('setup'));
        act(() => result.current.handleFairyTrigger());

        expect(result.current.showFlash).toBe(true);
    });

    it('navigates to /create?magic=... after 600ms', () => {
        const { result } = renderHook(() => useMagicTransition());

        act(() => result.current.triggerMagicTransition('setup'));
        act(() => result.current.handleFairyTrigger());

        expect(mockNavigate).not.toHaveBeenCalled();

        act(() => vi.advanceTimersByTime(600));

        expect(mockNavigate).toHaveBeenCalledTimes(1);
        const calledWith = mockNavigate.mock.calls[0][0] as string;
        expect(calledWith).toMatch(/^\/create\?magic=\d+$/);
    });

    it('hides fairy after navigate (600ms)', () => {
        const { result } = renderHook(() => useMagicTransition());

        act(() => result.current.triggerMagicTransition('setup'));
        act(() => result.current.handleFairyTrigger());
        act(() => vi.advanceTimersByTime(600));

        expect(result.current.showFairy).toBe(false);
    });

    it('clears showFlash and isTransitioning after 600 + 500ms', () => {
        const { result } = renderHook(() => useMagicTransition());

        act(() => result.current.triggerMagicTransition('setup'));
        act(() => result.current.handleFairyTrigger());

        act(() => vi.advanceTimersByTime(600));
        // Flash and transitioning still active at 600ms
        expect(result.current.showFlash).toBe(true);
        expect(result.current.isTransitioning).toBe(true);

        act(() => vi.advanceTimersByTime(500));
        expect(result.current.showFlash).toBe(false);
        expect(result.current.isTransitioning).toBe(false);
    });

    // ── Full sequence ──────────────────────────────────────────────────────

    it('full sequence: trigger → fairy → flash → navigate → cleanup', () => {
        const { result } = renderHook(() => useMagicTransition());

        // Step 1: trigger
        act(() => result.current.triggerMagicTransition('setup'));
        expect(result.current.isTransitioning).toBe(true);
        expect(result.current.showFairy).toBe(true);

        // Step 2: fairy waved
        act(() => result.current.handleFairyTrigger());
        expect(result.current.showFlash).toBe(true);

        // Step 3: navigate fires
        act(() => vi.advanceTimersByTime(600));
        expect(mockNavigate).toHaveBeenCalled();
        expect(result.current.showFairy).toBe(false);

        // Step 4: full cleanup
        act(() => vi.advanceTimersByTime(500));
        expect(result.current.showFlash).toBe(false);
        expect(result.current.isTransitioning).toBe(false);
    });

    // ── magic param uniqueness ─────────────────────────────────────────────

    it('generates unique magic param on each call', () => {
        const { result } = renderHook(() => useMagicTransition());

        act(() => result.current.triggerMagicTransition('setup'));
        act(() => result.current.handleFairyTrigger());
        act(() => vi.advanceTimersByTime(600));

        const firstCall = mockNavigate.mock.calls[0][0] as string;
        const firstTs = firstCall.split('magic=')[1];

        // Advance time so Date.now() differs
        vi.advanceTimersByTime(100);

        act(() => result.current.triggerMagicTransition('setup'));
        act(() => result.current.handleFairyTrigger());
        act(() => vi.advanceTimersByTime(600));

        const secondCall = mockNavigate.mock.calls[1][0] as string;
        const secondTs = secondCall.split('magic=')[1];

        expect(firstTs).not.toBe(secondTs);
    });
});
