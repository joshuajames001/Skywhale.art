import { useState, useEffect, useRef, RefObject } from 'react';

export type ScrollDirection = 'up' | 'down' | 'top';

/**
 * Detects scroll direction on a scrollable element (not window).
 * Returns 'top' when near the top, 'down' when scrolling down, 'up' when scrolling up.
 */
export const useScrollDirection = (
    scrollRef: RefObject<HTMLElement | null>,
    threshold = 10
): ScrollDirection => {
    const [direction, setDirection] = useState<ScrollDirection>('top');
    const lastScrollTop = useRef(0);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const handleScroll = () => {
            const currentScrollTop = el.scrollTop;

            if (currentScrollTop < threshold) {
                setDirection('top');
            } else if (currentScrollTop > lastScrollTop.current + threshold) {
                setDirection('down');
            } else if (currentScrollTop < lastScrollTop.current - threshold) {
                setDirection('up');
            }

            lastScrollTop.current = currentScrollTop;
        };

        el.addEventListener('scroll', handleScroll, { passive: true });
        return () => el.removeEventListener('scroll', handleScroll);
    }, [scrollRef, threshold]);

    return direction;
};
