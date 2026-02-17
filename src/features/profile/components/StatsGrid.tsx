import { motion } from 'framer-motion';
import { TrendingUp, Calendar } from 'lucide-react';
import { UserStats } from '../hooks/useProfileStats';

interface StatsGridProps {
    stats: UserStats;
}

export const StatsGrid = ({ stats }: StatsGridProps) => {
    return (
        <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="mb-16"
        >
            <div className="flex items-center gap-3 mb-8">
                <TrendingUp className="text-blue-500" size={28} />
                <h2 className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Statistiky</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border-2 border-green-200 p-4 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                    <div className="text-xs text-green-600 font-bold uppercase mb-1">Vlastní Knihy</div>
                    <div className="text-2xl font-black text-slate-800">{stats.customBooksCount}</div>
                </div>
                <div className="bg-white border-2 border-blue-200 p-4 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                    <div className="text-xs text-blue-600 font-bold uppercase mb-1">Nejdelší Kniha</div>
                    <div className="text-2xl font-black text-slate-800">{stats.longestBook} str.</div>
                </div>
                <div className="bg-white border-2 border-pink-200 p-4 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                    <div className="text-xs text-pink-600 font-bold uppercase mb-1">Oblíbený Styl</div>
                    <div className="text-lg font-black text-slate-800 truncate">{stats.favoriteStyle}</div>
                </div>
                <div className="bg-white border-2 border-purple-200 p-4 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                    <div className="text-xs text-purple-600 font-bold uppercase mb-1 flex items-center gap-1">
                        <Calendar size={12} /> Člen Od
                    </div>
                    <div className="text-lg font-black text-slate-800">
                        {stats.memberSince ? new Date(stats.memberSince).toLocaleDateString('cs-CZ', { month: 'short', year: 'numeric' }) : '-'}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
