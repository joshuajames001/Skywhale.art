import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useEnergy = () => {
    const [balance, setBalance] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchBalance = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setBalance(null);
                return;
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('energy_balance')
                .eq('id', user.id)
                .single();

            if (data) {
                setBalance(data.energy_balance || 0);
            }
        } catch (err) {
            console.error("Failed to fetch energy balance", err);
        }
    };

    const GUMROAD_URLS: Record<string, string> = {
        'starter':          'https://ghostfactory.gumroad.com/l/Zvedavec',
        'writer':           'https://ghostfactory.gumroad.com/l/Spisovatel',
        'master_wordsmith': 'https://ghostfactory.gumroad.com/l/MistrSlova',
        'sub_start':        'https://ghostfactory.gumroad.com/l/Start',
        'sub_advanced':     'https://ghostfactory.gumroad.com/l/pokrocily',
        'sub_expert':       'https://ghostfactory.gumroad.com/l/expert',
        'sub_master':       'https://ghostfactory.gumroad.com/l/mistr',
    };

    const buyPackage = async (packageId: string) => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) throw new Error('Nejsi přihlášen/a.');

            const base = GUMROAD_URLS[packageId];
            if (!base) throw new Error('Neplatný balíček.');

            const email = session.user.email;
            window.location.href = email
                ? `${base}?email=${encodeURIComponent(email)}`
                : base;
        } catch (err) {
            console.error('Purchase failed:', err);
            const msg = err instanceof Error ? err.message : JSON.stringify(err);
            alert(`Nákup selhal: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    // Check for monthly subscription grant
    const checkSubscriptionClaim = async (userId: string) => {
        try {
            const { data: profile } = await supabase
                .from('profiles')
                .select('next_energy_grant, subscription_status')
                .eq('id', userId)
                .single();

            if (profile?.subscription_status === 'active' && profile.next_energy_grant) {
                const nextGrant = new Date(profile.next_energy_grant);
                const now = new Date();

                if (now >= nextGrant) {
                    console.log("🎁 Monthly Energy Grant Available! Claiming...");
                    const { data, error } = await supabase.rpc('claim_monthly_energy', { user_id: userId });
                    
                    if (data && data.success) {
                        console.log(`✅ Claimed ${data.amount} energy. Next grant: ${data.next_grant}`);
                        // Force refresh balance
                        const { data: userData } = await supabase.from('profiles').select('energy_balance').eq('id', userId).single();
                        if (userData) setBalance(userData.energy_balance);
                        
                        // Optional: Could trigger a toast here if we had access to it, 
                        // but since we are in a hook, we might just rely on the balance update 
                        // or dispatch a custom event if needed.
                    }
                }
            }
        } catch (err) {
            console.error("Error checking subscription claim:", err);
        }
    };

    useEffect(() => {
        let channel: ReturnType<typeof supabase.channel>;

        const setupRealtime = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            
            // Initial fetch
            if (user) {
                // 1. Fetch balance
                const { data } = await supabase
                    .from('profiles')
                    .select('energy_balance')
                    .eq('id', user.id)
                    .single();
                if (data) setBalance(data.energy_balance || 0);

                // 2. Check for Subscription Drip
                await checkSubscriptionClaim(user.id);

                // Setup listener specifically for this user
                console.log("🔌 Connecting to Realtime for user:", user.id);
                channel = supabase.channel(`profile-updates`)
                    .on(
                        'postgres_changes',
                        { 
                            event: 'UPDATE', 
                            schema: 'public', 
                            table: 'profiles'
                        },
                        (payload) => {
                            if (payload.new && (payload.new as any).id === user.id) {
                                console.log("⚡ Realtime Balance Update:", payload);
                                const newBalance = (payload.new as any).energy_balance;
                                if (typeof newBalance === 'number') {
                                    setBalance(newBalance);
                                }
                            }
                        }
                    )
                    .subscribe((status) => {
                        console.log("🔌 Realtime Status:", status);
                    });
            } else {
                setBalance(null);
            }
        };

        setupRealtime();

        return () => {
            if (channel) supabase.removeChannel(channel);
        };
    }, []);

    const claimEnergy = async (): Promise<{ success: boolean; energyAdded?: number; message?: string }> => {
        try {
            const { data, error } = await supabase.rpc('claim_monthly_energy');
            if (error) throw error;
            if (data?.success) {
                await fetchBalance();
                return { success: true, energyAdded: data.energy_added || data.amount };
            }
            return { success: false, message: data?.message || 'Neznámá chyba' };
        } catch (e: any) {
            console.error('Claim Error:', e);
            return { success: false, message: e.message };
        }
    };

    return {
        balance,
        loading,
        buyPackage,
        claimEnergy,
        refreshBalance: fetchBalance
    };
};
