import { motion } from 'framer-motion';

interface DifficultySelectorProps {
    onSelectDifficulty: (diff: 3 | 4 | 5) => void;
}

export const DifficultySelector = ({ onSelectDifficulty }: DifficultySelectorProps) => {
    return (
        <motion.div
            initial={{ opacity: 1, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex flex-wrap items-center justify-center gap-6"
        >
            <DifficultyCard level={3} label="Učeň" grid="3x3" color="emerald" onClick={() => onSelectDifficulty(3)} />
            <DifficultyCard level={4} label="Kouzelník" grid="4x4" color="cyan" onClick={() => onSelectDifficulty(4)} />
            <DifficultyCard level={5} label="Velmistr" grid="5x5" color="violet" onClick={() => onSelectDifficulty(5)} />
        </motion.div>
    );
};

const DifficultyCard = ({ level, label, grid, color, onClick }: any) => {
    const bgColors: any = {
        emerald: 'bg-emerald-500',
        cyan: 'bg-cyan-600',
        violet: 'bg-violet-600'
    };

    // Explicit border and background to ensure visibility
    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className="w-48 h-64 bg-white/70 border-2 border-purple-200 rounded-3xl p-6 flex flex-col items-center justify-center gap-4 relative overflow-hidden group shadow-lg z-10"
        >
            {/* Always visible background gradient */}
            <div className={`absolute inset-0 ${bgColors[color]} opacity-20 group-hover:opacity-30 transition-opacity`} />

            <div className={`w-16 h-16 rounded-2xl ${bgColors[color]} flex items-center justify-center shadow-lg`}>
                <span className="text-white font-bold text-2xl">{level}</span>
            </div>

            <div className="text-center relative z-10">
                <h4 className="text-xl font-bold text-slate-800 mb-2">
                    {label}
                </h4>
                <div className="bg-white/60 px-3 py-1 rounded-full border border-purple-200">
                    <p className="text-purple-600 font-mono text-sm">{grid}</p>
                </div>
            </div>
        </motion.button>
    );
};
