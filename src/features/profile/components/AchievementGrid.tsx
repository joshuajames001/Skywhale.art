import { motion } from 'framer-motion';
import { Trophy, Star, Lock } from 'lucide-react';
import { Achievement, UserStats } from '../hooks/useProfileStats';

interface AchievementGridProps {
    achievements: Achievement[];
    stats: UserStats;
    loading: boolean;
}

export const AchievementGrid = ({ achievements, stats, loading }: AchievementGridProps) => {
    return (
        <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
        >
            <div className="flex items-center gap-3 mb-8">
                <Trophy className="text-amber-500" size={28} />
                <h2 className="text-2xl font-black bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">Úspěchy</h2>
                <span className="ml-auto text-sm text-slate-600 font-bold bg-white px-3 py-1 rounded-full shadow-md">
                    {achievements.filter(a => a.unlocked_at).length} / {achievements.length}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-32 bg-white/50 rounded-2xl animate-pulse" />)
                ) : achievements.map((ach) => {
                    const isUnlocked = !!ach.unlocked_at;

                    let progress = 0;
                    let progressText = '';
                    if (!isUnlocked && ach.condition_type === 'book_count') {
                        progress = Math.min((stats.booksCount / ach.threshold) * 100, 100);
                        progressText = `${stats.booksCount}/${ach.threshold}`;
                    } else if (!isUnlocked && ach.condition_type === 'referral_count') {
                        progress = Math.min(((stats.referralCount || 0) / ach.threshold) * 100, 100);
                        progressText = `${(stats.referralCount || 0)}/${ach.threshold}`;
                    }

                    return (
                        <div
                            key={ach.id}
                            className={`relative p-6 rounded-2xl border-2 transition-all duration-300 shadow-lg hover:shadow-xl ${isUnlocked
                                ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300'
                                : 'bg-white/60 border-slate-200 opacity-70'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-md ${isUnlocked ? 'bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-white' : 'bg-slate-100'
                                    }`}>
                                    {isUnlocked ? ach.icon : <Lock size={20} className="text-slate-400" />}
                                </div>
                                <div className="flex-1">
                                    <h3 className={`font-bold mb-1 ${isUnlocked ? 'text-slate-800' : 'text-slate-500'}`}>
                                        {ach.title}
                                    </h3>
                                    <p className="text-sm text-slate-600 leading-tight">
                                        {ach.description}
                                    </p>

                                    {!isUnlocked && progress > 0 && (
                                        <div className="mt-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs text-slate-600 font-bold">{progressText}</span>
                                                <span className="text-xs text-slate-500">{Math.round(progress)}%</span>
                                            </div>
                                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {isUnlocked && (
                                <div className="absolute top-4 right-4 text-amber-400/30">
                                    <Star size={64} className="fill-current rotate-12" />
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </motion.div>
    );
};
