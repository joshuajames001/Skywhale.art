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
            .select('last_claim_date, claim_streak')
            .eq('id', user.id)
            .single();

        if (!profile) return;

        const lastClaim = profile.last_claim_date ? new Date(profile.last_claim_date) : null;
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // Skip client-side check if already claimed today — no modal needed
        if (lastClaim && lastClaim >= startOfToday) return;

        // Check if streak is broken (last claim was before yesterday)
        const startOfYesterday = new Date(startOfToday);
        startOfYesterday.setDate(startOfYesterday.getDate() - 1);

        let currentStreak = profile.claim_streak || 0;
        if (lastClaim && lastClaim < startOfYesterday) {
            currentStreak = 0; // Streak broken
        }

        const newStreak = currentStreak + 1;

        // Attempt to claim via RPC — only show modal if reward was actually granted
        const { data, error } = await supabase.rpc('claim_daily_reward', {
            user_id: user.id,
            streak: newStreak
        });

        if (error) {
            console.error('Failed to claim reward:', error);
            return;
        }

        // RPC returns { success: false, message: "Already claimed today" } if duplicate
        if (data && typeof data === 'object' && 'success' in data && !data.success) return;

        setRewardStreak(newStreak);
        setShowDailyReward(true);
    };

    const handleClaimReward = async () => {
        // Reward already claimed in checkDailyReward — just close the modal
        setShowDailyReward(false);
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
