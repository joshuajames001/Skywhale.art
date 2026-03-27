import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { CardPage } from '../types';

export const useSharedCard = (cardId: string | null) => {
    const [pages, setPages] = useState<CardPage[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!cardId) {
            setLoading(false);
            return;
        }

        const fetchCard = async () => {
            setLoading(true);
            setError(null);

            const { data, error: dbError } = await supabase
                .from('shared_cards')
                .select('pages')
                .eq('id', cardId)
                .single();

            if (data && data.pages) {
                setPages(data.pages);
            } else {
                console.error('Failed to load card', dbError);
                setError(dbError?.message || 'Card not found');
            }
            setLoading(false);
        };

        fetchCard();
    }, [cardId]);

    return { pages, loading, error };
};
