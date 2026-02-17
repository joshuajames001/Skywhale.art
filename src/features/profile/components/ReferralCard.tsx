import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

interface ReferralCardProps {
    referralCode: string | null;
    referralCount: number;
}

export const ReferralCard = ({ referralCode, referralCount }: ReferralCardProps) => {
    return (
        <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.08 }}
            className="mb-16"
        >
            <div className="flex items-center gap-3 mb-8">
                <Star className="text-yellow-400" size={28} />
                <h2 className="text-2xl font-black bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Pozvi Přátele</h2>
            </div>

            <div className="bg-white/80 backdrop-blur-md border-2 border-yellow-200 rounded-3xl p-8 shadow-xl relative overflow-hidden group">
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl group-hover:bg-yellow-400/20 transition-all" />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Sdílej radost z tvoření!</h3>
                        <p className="text-slate-600 mb-4">
                            Pošli svůj unikátní kód přátelům. Když se zaregistrují, získáte oba extra Energii! ⚡
                        </p>
                        <div className="flex items-center gap-4">
                            <div className="bg-slate-100 border-2 border-slate-200 rounded-xl px-4 py-2 font-mono text-lg font-bold tracking-widest text-slate-700 select-all">
                                {referralCode ? `${window.location.origin}/?ref=${referralCode}` : 'Načítám...'}
                            </div>
                            <button
                                onClick={() => {
                                    if (referralCode) {
                                        const link = `${window.location.origin}/?ref=${referralCode}`;
                                        navigator.clipboard.writeText(link);
                                        alert("Odkaz zkopírován! 📋");
                                    }
                                }}
                                className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold rounded-xl shadow-md transition-all hover:scale-105 disabled:opacity-50"
                                disabled={!referralCode}
                            >
                                Zkopírovat Odkaz
                            </button>
                        </div>
                    </div>
                    <div className="w-full md:w-auto flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-sm text-slate-600 font-bold bg-white/50 px-3 py-1 rounded-full">
                            <span>👯 Přivedeno přátel:</span>
                            <span className="text-yellow-600 text-lg">{referralCount || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
