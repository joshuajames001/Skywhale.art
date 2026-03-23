import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

describe('useLocalStorage', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
    });

    // ── Initial value ────────────────────────────────────────────────────

    it('returns initialValue when localStorage is empty', () => {
        const { result } = renderHook(() => useLocalStorage('test-key', 42));
        expect(result.current[0]).toBe(42);
    });

    it('returns stored value when localStorage has data', () => {
        localStorage.setItem('test-key', JSON.stringify('hello'));
        const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
        expect(result.current[0]).toBe('hello');
    });

    it('returns initialValue when localStorage has invalid JSON', () => {
        localStorage.setItem('bad-key', '{not valid json');
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const { result } = renderHook(() => useLocalStorage('bad-key', 'fallback'));
        expect(result.current[0]).toBe('fallback');

        consoleSpy.mockRestore();
    });

    // ── setValue ──────────────────────────────────────────────────────────

    it('setValue updates state and localStorage', () => {
        const { result } = renderHook(() => useLocalStorage('key', 0));

        act(() => {
            result.current[1](99);
        });

        expect(result.current[0]).toBe(99);
        expect(JSON.parse(localStorage.getItem('key')!)).toBe(99);
    });

    it('setValue accepts a function updater', () => {
        const { result } = renderHook(() => useLocalStorage('counter', 10));

        act(() => {
            result.current[1]((prev) => prev + 5);
        });

        expect(result.current[0]).toBe(15);
        expect(JSON.parse(localStorage.getItem('counter')!)).toBe(15);
    });

    // ── Complex types ────────────────────────────────────────────────────

    it('works with complex objects', () => {
        const initial = { name: 'Luna', age: 5, tags: ['whale', 'blue'] };
        const { result } = renderHook(() => useLocalStorage('obj-key', initial));

        expect(result.current[0]).toEqual(initial);

        const updated = { name: 'Nova', age: 3, tags: ['star'] };
        act(() => {
            result.current[1](updated);
        });

        expect(result.current[0]).toEqual(updated);
        expect(JSON.parse(localStorage.getItem('obj-key')!)).toEqual(updated);
    });

    // ── Key isolation ────────────────────────────────────────────────────

    it('different keys do not interfere', () => {
        const { result: hook1 } = renderHook(() => useLocalStorage('key-a', 'A'));
        const { result: hook2 } = renderHook(() => useLocalStorage('key-b', 'B'));

        act(() => {
            hook1.current[1]('A-updated');
        });

        expect(hook1.current[0]).toBe('A-updated');
        expect(hook2.current[0]).toBe('B');
    });
});
