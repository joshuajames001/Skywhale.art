import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { validateNickname } from '../../../lib/content-policy';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    condition_type: string;
    threshold: number;
    unlocked_at?: string;
}

export interface UserStats {
    booksCount: number;
    customBooksCount: number;
    longestBook: number;
    favoriteStyle: string;
    memberSince: Date | null;
    referralCount: number;
    subscription?: {
        status?: string;
        nextGrant?: string;
    };
}

export const useProfileStats = (user: any) => {
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [stats, setStats] = useState<UserStats>({
        booksCount: 0,
        customBooksCount: 0,
        longestBook: 0,
        favoriteStyle: 'Neznámý',
        memberSince: null,
        referralCount: 0
    });
    const [loading, setLoading] = useState(true);
    const [nickname, setNickname] = useState('');
    const [avatarEmoji, setAvatarEmoji] = useState('👤');
    const [level, setLevel] = useState(1);
    const [referralCode, setReferralCode] = useState<string | null>(null);

    // Calculate level based on unlocked achievements
    const calculateLevel = (unlockedCount: number): number => {
        if (unlockedCount >= 50) return 8;
        if (unlockedCount >= 40) return 7;
        if (unlockedCount >= 30) return 6;
        if (unlockedCount >= 20) return 5;
        if (unlockedCount >= 15) return 4;
        if (unlockedCount >= 10) return 3;
        if (unlockedCount >= 5) return 2;
        return 1;
    };

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                // 1. Fetch Profile Data
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('nickname, avatar_emoji, created_at, referral_code, subscription_status, next_energy_grant')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    setNickname(profile.nickname || '');
                    setAvatarEmoji(profile.avatar_emoji || '👤');
                    setReferralCode(profile.referral_code || null);
                    setStats(prev => ({ ...prev, memberSince: profile.created_at ? new Date(profile.created_at) : null }));
                }

                // 2. Fetch Book Stats
                const { count: booksCount } = await supabase
                    .from('books')
                    .select('*', { count: 'exact', head: true })
                    .eq('owner_id', user.id);

                // 3. Fetch Custom Books Count
                const { count: customBooksCount } = await supabase
                    .from('books')
                    .select('*', { count: 'exact', head: true })
                    .eq('owner_id', user.id)
                    .eq('visual_style', 'watercolor');

                // 4. Fetch Books with Pages for longest book
                const { data: books } = await supabase
                    .from('books')
                    .select('id, pages(count)')
                    .eq('owner_id', user.id);

                const longestBook = books?.reduce((max, book: any) => {
                    const pageCount = book.pages?.[0]?.count || 0;
                    return pageCount > max ? pageCount : max;
                }, 0) || 0;

                // 5. Fetch Most Used Style
                const { data: styleData } = await supabase
                    .from('books')
                    .select('visual_style')
                    .eq('owner_id', user.id);

                const styleCounts: Record<string, number> = {};
                styleData?.forEach((book: any) => {
                    const style = book.visual_style || 'Neznámý';
                    styleCounts[style] = (styleCounts[style] || 0) + 1;
                });

                const favoriteStyle = Object.keys(styleCounts).length > 0
                    ? Object.keys(styleCounts).reduce((a, b) => styleCounts[a] > styleCounts[b] ? a : b)
                    : 'Neznámý';

                // 5.5 Fetch Referral Count (Securely using RPC)
                const { data: referralCount, error: refError } = await supabase
                    .rpc('get_referral_count', { p_referrer_id: user.id });

                if (refError) console.error("Referral Count Error:", refError);

                setStats(prev => ({
                    ...prev,
                    booksCount: booksCount || 0,
                    customBooksCount: customBooksCount || 0,
                    longestBook,
                    favoriteStyle,
                    referralCount: referralCount || 0,
                    subscription: {
                        status: profile?.subscription_status,
                        nextGrant: profile?.next_energy_grant
                    }
                }));

                // 7. Fetch Achievements
                const { data: allAchievements } = await supabase
                    .from('achievements')
                    .select('*');

                const { data: userUnlocks } = await supabase
                    .from('user_achievements')
                    .select('achievement_id, unlocked_at')
                    .eq('user_id', user.id);

                const merged = (allAchievements || []).map(ach => {
                    const unlock = userUnlocks?.find(u => u.achievement_id === ach.id);
                    return {
                        ...ach,
                        unlocked_at: unlock ? unlock.unlocked_at : undefined
                    };
                });

                setAchievements(merged);

                // Calculate and set level
                const unlockedCount = merged.filter(a => a.unlocked_at).length;
                setLevel(calculateLevel(unlockedCount));

            } catch (err) {
                console.error("Error loading profile:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [user]);

    const updateAvatar = async (emoji: string) => {
        setAvatarEmoji(emoji);
        if (user) {
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    avatar_emoji: emoji
                }, {
                    onConflict: 'id'
                });

            if (error) {
                console.error('Error saving avatar:', error);
            }
        }
    };

    const updateNickname = async (newNickname: string): Promise<string | null> => {
        const policy = validateNickname(newNickname);
        if (policy.blocked) return policy.reason ?? 'Neplatná přezdívka.';

        if (user && newNickname.trim()) {
            setNickname(newNickname);
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    nickname: newNickname
                }, {
                    onConflict: 'id'
                });

            if (error) {
                console.error('Error saving nickname:', error);
            }
        }
        return null;
    };

    return {
        stats,
        achievements,
        loading,
        nickname,
        avatarEmoji,
        level,
        referralCode,
        updateAvatar,
        updateNickname
    };
};
