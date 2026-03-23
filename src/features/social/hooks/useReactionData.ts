import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../../lib/supabase';

interface Reaction {
    type: 'heart' | 'star' | 'fire' | 'clap' | 'rocket';
    count: number;
    userReacted: boolean;
}

const INITIAL_REACTIONS: Reaction[] = [
    { type: 'heart', count: 0, userReacted: false },
    { type: 'star', count: 0, userReacted: false },
    { type: 'fire', count: 0, userReacted: false },
    { type: 'clap', count: 0, userReacted: false },
    { type: 'rocket', count: 0, userReacted: false },
];

export const useReactionData = (bookId: string) => {
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [reactions, setReactions] = useState<Reaction[]>(INITIAL_REACTIONS);
    const [loading, setLoading] = useState(true);
    const reactionsRef = useRef(reactions);
    reactionsRef.current = reactions;

    // Get current user
    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUserId(user?.id || null);
        };
        getUser();
    }, []);

    const fetchReactions = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('book_reactions')
                .select('reaction_type, user_id')
                .eq('book_id', bookId);

            if (error) console.error('Error fetching reactions:', error);

            if (data) {
                const newReactions = reactionsRef.current.map(r => {
                    const typeReactions = data.filter((d: any) => d.reaction_type === r.type);
                    return {
                        ...r,
                        count: typeReactions.length,
                        userReacted: currentUserId ? typeReactions.some((d: any) => d.user_id === currentUserId) : false,
                    };
                });
                setReactions(newReactions);
            }
        } finally {
            setLoading(false);
        }
    }, [bookId, currentUserId]);

    // Fetch + subscribe when user is known
    useEffect(() => {
        if (!currentUserId) return;
        fetchReactions();

        const subscription = supabase
            .channel(`public:book_reactions:book_id=eq.${bookId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'book_reactions',
                filter: `book_id=eq.${bookId}`,
            }, () => {
                fetchReactions();
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [bookId, currentUserId, fetchReactions]);

    const toggleReaction = async (type: string) => {
        if (!currentUserId) return;

        const currentReaction = reactions.find(r => r.type === type);
        if (!currentReaction) return;

        // Optimistic update
        setReactions(prev => prev.map(r =>
            r.type === type
                ? { ...r, count: r.userReacted ? r.count - 1 : r.count + 1, userReacted: !r.userReacted }
                : r
        ));

        if (currentReaction.userReacted) {
            await supabase
                .from('book_reactions')
                .delete()
                .eq('book_id', bookId)
                .eq('user_id', currentUserId)
                .eq('reaction_type', type);
        } else {
            await supabase
                .from('book_reactions')
                .insert({
                    book_id: bookId,
                    user_id: currentUserId,
                    reaction_type: type,
                });
        }
    };

    return { reactions, loading, currentUserId, toggleReaction };
};
