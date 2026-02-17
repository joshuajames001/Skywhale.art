import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useDailyReward = () => {
    const [showDailyReward, setShowDailyReward] = useState(false);
    const [rewardStreak, setRewardStreak] = useState(0);

    const checkDailyReward = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
            .from('profiles')
            .select('last_claim_date, claim_streak, energy_balance')
            .eq('id', user.id)
            .single();

        if (profile) {
            const lastClaim = profile.last_claim_date ? new Date(profile.last_claim_date) : null;
            const now = new Date();
            const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            // If never claimed, or claimed before today
            if (!lastClaim || lastClaim < startOfToday) {
                // Check if streak is broken (last claim was before yesterday)
                const startOfYesterday = new Date(startOfToday);
                startOfYesterday.setDate(startOfYesterday.getDate() - 1);

                let currentStreak = profile.claim_streak || 0;

                if (lastClaim && lastClaim < startOfYesterday) {
                    currentStreak = 0; // Streak broken
                }

                setRewardStreak(currentStreak);
                setShowDailyReward(true);
            }
        }
    };

    const handleClaimReward = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Re-fetch current profile to get latest energy_balance from database
        const { data: currentProfile } = await supabase
            .from('profiles')
            .select('energy_balance')
            .eq('id', user.id)
            .single();

        if (!currentProfile) return;

        const newStreak = rewardStreak + 1;
        const isDay7 = newStreak % 7 === 0;
        const rewardAmount = isDay7 ? 30 : 10; // Original rewards (no inflation)

        // FIXED: Secure RPC call
        const { error } = await supabase.rpc('claim_daily_reward', {
            user_id: user.id,
            streak: newStreak
        });

        if (error) {
            console.error('Failed to claim reward:', error);
            return;
        }

        // Optimistic UI Update (Verification: Real balance comes from subscription/listener)
        // We don't reload window anymore
        setRewardStreak(newStreak);
        setShowDailyReward(false);

        // Refresh 
        window.location.reload(); // Simple refresh to update global state or just re-fetch
    };

    // Auto-check on mount
    useEffect(() => {
        checkDailyReward();
    }, []);

    return {
        showDailyReward,
        setShowDailyReward,
        rewardStreak,
        handleClaimReward
    };
};
