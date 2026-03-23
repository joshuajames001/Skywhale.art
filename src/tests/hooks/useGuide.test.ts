import { describe, it, expect, beforeEach } from 'vitest';
import { useGuide } from '../../hooks/useGuide';
import { act } from '@testing-library/react';

describe('useGuide', () => {
    beforeEach(() => {
        // Reset zustand store between tests
        act(() => {
            const store = useGuide.getState();
            useGuide.setState({
                activeGuide: null,
                step: 0,
                hasSeenGroups: {},
            });
        });
    });

    it('has correct initial state', () => {
        const state = useGuide.getState();
        expect(state.activeGuide).toBeNull();
        expect(state.step).toBe(0);
        expect(state.hasSeenGroups).toEqual({});
    });

    it('startGuide sets activeGuide and resets step', () => {
        act(() => useGuide.getState().startGuide('welcome'));
        const state = useGuide.getState();
        expect(state.activeGuide).toBe('welcome');
        expect(state.step).toBe(0);
    });

    it('nextStep increments step', () => {
        act(() => {
            useGuide.getState().startGuide('tour');
            useGuide.getState().nextStep();
            useGuide.getState().nextStep();
        });
        expect(useGuide.getState().step).toBe(2);
    });

    it('closeGuide marks active guide as seen and resets', () => {
        act(() => {
            useGuide.getState().startGuide('intro');
            useGuide.getState().closeGuide();
        });
        const state = useGuide.getState();
        expect(state.activeGuide).toBeNull();
        expect(state.step).toBe(0);
        expect(state.hasSeenGroups['intro']).toBe(true);
    });

    it('closeGuide without active guide just resets', () => {
        act(() => useGuide.getState().closeGuide());
        const state = useGuide.getState();
        expect(state.activeGuide).toBeNull();
        expect(state.step).toBe(0);
    });

    it('markAsSeen adds guide to hasSeenGroups', () => {
        act(() => useGuide.getState().markAsSeen('feature_tour'));
        expect(useGuide.getState().hasSeenGroups['feature_tour']).toBe(true);
    });

    it('resetGuides clears all seen groups', () => {
        act(() => {
            useGuide.getState().markAsSeen('a');
            useGuide.getState().markAsSeen('b');
            useGuide.getState().resetGuides();
        });
        expect(useGuide.getState().hasSeenGroups).toEqual({});
    });
});
