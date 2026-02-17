import { motion } from 'framer-motion';
import { Calendar, Zap, Lock } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { UserStats } from '../hooks/useProfileStats';

interface EnergyCardProps {
    stats: UserStats;
}

export const EnergyCard = ({ stats }: EnergyCardProps) => {
    return (
        <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.02 }}
            className="mb-16"
        >
            {/* Only show if user has ever had a subscription or active one */}
            {stats.subscription?.status === 'active' || stats.subscription?.status === 'past_due' ? (
                <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                                <div className="bg-indigo-500/30 p-2 rounded-lg">
                                    <Calendar size={20} className="text-indigo-300" />
                                </div>
                                <span className="text-indigo-300 font-bold uppercase tracking-wider text-sm">Předplatné</span>
                                <span className="bg-green-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Aktivní</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-1">Měsíční Příděl Energie</h3>
                            <p className="text-indigo-200/80 text-sm">
                                {stats.subscription?.nextGrant && new Date(stats.subscription.nextGrant) <= new Date()
                                    ? "Tvoje dávka energie je připravena k vyzvednutí!"
                                    : `Další příděl energie bude dostupný ${new Date(stats.subscription.nextGrant!).toLocaleDateString()}.`}
                            </p>
                        </div>

                        {/* Action Button */}
                        <div>
                            {stats.subscription?.nextGrant && new Date(stats.subscription.nextGrant) <= new Date() ? (
                                <button
                                    onClick={async () => {
                                        try {
                                            const { data, error } = await supabase.rpc('claim_monthly_energy');
                                            if (error) throw error;
                                            if (data?.success) {
                                                alert(`🎉 Energie připsána! Získáváš ${data.energy_added} Energie.`);
                                                // Refresh profile to update balance and date
                                                window.location.reload();
                                            } else {
                                                alert("Něco se pokazilo: " + (data?.message || "Neznámá chyba"));
                                            }
                                        } catch (e: any) {
                                            console.error("Claim Error:", e);
                                            alert("Chyba při nárokování energie: " + e.message);
                                        }
                                    }}
                                    className="px-8 py-3 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-white font-black rounded-xl shadow-lg shadow-orange-500/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                                >
                                    <Zap size={20} className="fill-white" /> Nárokovat Energii
                                </button>
                            ) : (
                                <button disabled className="px-8 py-3 bg-white/10 text-white/40 font-bold rounded-xl border border-white/5 cursor-not-allowed flex items-center gap-2">
                                    <Lock size={16} />
                                    Brzy dostupné
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ) : null}
        </motion.div>
    );
};
