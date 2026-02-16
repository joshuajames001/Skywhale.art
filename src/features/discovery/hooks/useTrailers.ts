import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { DiscoveryCategory } from '../../../types/discovery';

export const useTrailers = (categories: DiscoveryCategory[], i18n: any) => {
    const [categoryTrailers, setCategoryTrailers] = useState<Record<string, string>>({});

    useEffect(() => {
        const loadTrailers = async () => {
            // 2. Load Trailers (scan books for trailer_urls to use as category intros)
            const { data: trailerData } = await supabase
                .from('discovery_books')
                .select('category_id, trailer_url')
                .not('trailer_url', 'is', null);

            // --- HARD FIX MOVED UP ---
            const DINO_CAT_ID = '75adc9f6-53e5-44b6-853d-ab77e982f2a2';
            const trailerMap: Record<string, string> = {};

            if (trailerData) {
                trailerData.forEach((item: any) => {
                    // Start with DB value
                    let finalUrl = item.trailer_url;

                    // Override broken URL for Dino category if found
                    if (item.category_id === DINO_CAT_ID) {
                        finalUrl = '/discovery/trailer-final.mp4';
                    }

                    // Use the first trailer found for a category as its intro
                    if (finalUrl && !trailerMap[item.category_id]) {
                        trailerMap[item.category_id] = finalUrl;

                        // PRELOAD IMMEDIATELY
                        const link = document.createElement('link');
                        link.rel = 'preload';
                        link.as = 'fetch'; // 'video' can be buggy in some browsers
                        link.href = finalUrl;
                        document.head.appendChild(link);
                    }
                });
            }
            // Ensure manual override if not found in data
            if (!trailerMap[DINO_CAT_ID]) trailerMap[DINO_CAT_ID] = '/discovery/trailer-final.mp4';

            setCategoryTrailers(trailerMap);
        };

        loadTrailers();
    }, []);

    const checkTrailerSeen = (categoryId: string) => {
        const seenKey = `seen_trailer_cat_${categoryId}`;
        return localStorage.getItem(seenKey) === 'true';
    };

    const markTrailerSeen = (categoryId: string) => {
        localStorage.setItem(`seen_trailer_cat_${categoryId}`, 'true');
    };

    return {
        categoryTrailers,
        checkTrailerSeen,
        markTrailerSeen
    };
};
