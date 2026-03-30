import { useRef, useEffect, useCallback } from 'react';
import { generateImage } from '../../../lib/ai';
import { StoryBook } from '../../../types';

/**
 * GF-236: Prefetch next page image in the background.
 * When the current page's image finishes generating, silently starts
 * generating the next page's image (N+1) so it's ready when the user turns the page.
 */
export function usePrefetchNextPage(
    story: StoryBook,
    currentIndex: number,
    onUploadImage?: (bookId: string, pageNumber: number, url: string) => Promise<string | null>,
    onUpdatePage?: (pageNumber: number, updates: Record<string, any>) => void
) {
    // Track which pages we've already started prefetching to avoid duplicates
    const prefetchedRef = useRef<Set<number>>(new Set());
    // Track in-flight prefetch to prevent concurrent runs
    const inFlightRef = useRef<number | null>(null);

    const prefetchPage = useCallback(async (pageIndex: number) => {
        const page = story.pages[pageIndex];
        if (!page) return; // Out of bounds
        if (page.image_url) return; // Already has an image
        if (prefetchedRef.current.has(page.page_number)) return; // Already prefetching/prefetched
        if (inFlightRef.current === page.page_number) return; // Currently in flight

        // Mark as in-flight
        prefetchedRef.current.add(page.page_number);
        inFlightRef.current = page.page_number;

        // Build the same reference chain as BookReader
        const anchorReference = story.character_sheet_url;
        let referenceUrl = anchorReference;
        if (pageIndex > 0) {
            const prevPage = story.pages[pageIndex - 1];
            if (prevPage?.image_url) {
                referenceUrl = prevPage.image_url;
            }
        }

        const prompt = (page.art_prompt || `Illustration of: ${page.text}`) +
            ", dynamic composition, varied camera angles, active poses, cinematic lighting";

        try {
            const result = await generateImage({
                prompt,
                style: story.visual_style,
                characterDescription: story.visual_dna || story.main_character,
                setting: story.setting,
                characterReference: referenceUrl,
                tier: story.tier as 'basic' | 'premium' | undefined,
                pageIndex: page.page_number,
                baseSeed: story.character_seed ?? undefined,
            });

            if (result.url && onUploadImage && onUpdatePage) {
                const publicUrl = await onUploadImage(story.book_id, page.page_number, result.url);
                if (publicUrl) {
                    onUpdatePage(page.page_number, { image_url: publicUrl });
                }
            }
        } catch (e) {
            console.warn(`Prefetch page ${page.page_number} failed (non-fatal):`, e);
        } finally {
            inFlightRef.current = null;
        }
    }, [story, onUploadImage, onUpdatePage]);

    // Trigger prefetch when current page gets its image
    useEffect(() => {
        // currentIndex 0 = cover, 1+ = pages
        if (currentIndex < 1) return; // Don't prefetch from cover

        const currentPageIndex = currentIndex - 1;
        const currentPage = story.pages[currentPageIndex];
        if (!currentPage?.image_url) return; // Current page not ready yet

        const nextPageIndex = currentPageIndex + 1;
        if (nextPageIndex >= story.pages.length) return; // No next page

        const nextPage = story.pages[nextPageIndex];
        if (nextPage?.image_url) return; // Next page already has image

        prefetchPage(nextPageIndex);
    }, [currentIndex, story.pages, prefetchPage]);
}
