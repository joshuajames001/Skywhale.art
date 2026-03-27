import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { StoryBook } from '../../../types';

interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlocked_at?: string;
}

function calculateLevel(achievementCount: number): number {
    if (achievementCount >= 50) return 8;
    if (achievementCount >= 40) return 7;
    if (achievementCount >= 30) return 6;
    if (achievementCount >= 20) return 5;
    if (achievementCount >= 15) return 4;
    if (achievementCount >= 10) return 3;
    if (achievementCount >= 5) return 2;
    return 1;
}

export const usePublicProfile = (userId: string) => {
    const [profile, setProfile] = useState<any>(null);
    const [books, setBooks] = useState<StoryBook[]>([]);
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(true);
    const [level, setLevel] = useState(1);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('id, nickname, avatar_emoji, created_at')
                    .eq('id', userId)
                    .single();

                setProfile(profileData);

                const { data: booksData } = await supabase
                    .from('books')
                    .select('*, pages(*)')
                    .eq('owner_id', userId)
                    .eq('is_public', true)
                    .order('created_at', { ascending: false });

                setBooks((booksData || []).map((book: any) => ({
                    ...book,
                    book_id: book.id,
                    cover_image: book.cover_image_url,
                    author_id: book.owner_id,
                    author_profile: profileData,
                    pages: (book.pages || [])
                        .sort((a: any, b: any) => (a.page_number ?? a.page_index) - (b.page_number ?? b.page_index))
                        .map((p: any) => ({
                            ...p,
                            page_number: p.page_number || p.page_index,
                            text: p.content,
                            is_generated: !!p.image_url,
                            layout_type: p.layout_type || 'standard'
                        }))
                })));

                const { data: achievementsData } = await supabase
                    .from('user_achievements')
                    .select(`
                        achievement_id,
                        unlocked_at,
                        achievements(id, title, description, icon)
                    `)
                    .eq('user_id', userId);

                const unlockedAchievements = (achievementsData || []).map((ua: any) => ({
                    ...ua.achievements,
                    unlocked_at: ua.unlocked_at
                }));

                setAchievements(unlockedAchievements);
                setLevel(calculateLevel(unlockedAchievements.length));
            } catch (err) {
                console.error('Error fetching public profile:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [userId]);

    return { profile, books, achievements, level, loading };
};
