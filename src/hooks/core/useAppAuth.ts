import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import { UserProfile as UserProfileType } from '../../types';

export const useAppAuth = () => {
    const [showAuth, setShowAuth] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfileType | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch user profile from database
    const fetchUserProfile = async (userId: string) => {
        try {
            const { data } = await supabase
                .from('profiles')
                .select('nickname, avatar_emoji, energy_balance, username')
                .eq('id', userId)
                .single();

            if (data) {
                setProfile({ ...data, id: userId });
            }
        } catch (err) {
            console.error('Failed to fetch profile:', err);
        }
    };

    // Check auth on mount
    useEffect(() => {
        // CLEAN UP URL FRAGMENTS (Fix for "Page Unavailable" / Loops)
        if (window.location.hash.includes('error=')) {
            console.warn("Clearing Auth Error Fragment:", window.location.hash);
            window.location.hash = ''; // Reset URL
        }

        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchUserProfile(session.user.id);
            }
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchUserProfile(session.user.id);
            } else {
                setProfile(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    return {
        user,
        profile,
        loading,
        showAuth,
        setShowAuth,
        refreshProfile: () => user && fetchUserProfile(user.id)
    };
};
