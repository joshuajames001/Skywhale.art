import { motion } from 'framer-motion';
import { X, Puzzle, Brain, Palette, Lock } from 'lucide-react';

interface GameMenuProps {
    onClose: () => void;
    onSelectGame: (type: 'puzzle' | 'pexeso' | 'coloring') => void;
}

export const GameMenu = ({ onClose, onSelectGame }: GameMenuProps) => {
    return (
        <motion.div
            key="menu"
            initial={{ opacity: 1, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full h-full flex flex-col items-center justify-center relative p-8"
        >
            <button
                onClick={onClose}
                className="absolute top-6 right-6 p-3 bg-white/60 hover:bg-white/80 rounded-full text-slate-600 hover:text-slate-800 backdrop-blur transition-all active:scale-95 z-50 shadow-sm"
            >
                <X size={24} />
            </button>

            <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 mb-12 drop-shadow-sm text-center font-title">
                Herna
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
                {/* Puzzle */}
                <GameCard
                    title="Puzzle"
                    icon={Puzzle}
                    color="violet"
                    description="Slož rozházené kousky příběhu zpátky dohromady."
                    onClick={() => onSelectGame('puzzle')}
                    delay={0.1}
                />

                {/* Pexeso */}
                <GameCard
                    title="Pexeso"
                    icon={Brain}
                    color="cyan"
                    description="Najdi všechny dvojice obrázků z tvých knížek."
                    onClick={() => onSelectGame('pexeso')}
                    delay={0.2}
                />

                {/* Coloring */}
                <GameCard
                    title="Kouzelné Barvy"
                    icon={Palette}
                    color="fuchsia"
                    description="Vybarvi si své oblíbené ilustrace podle čísel."
                    onClick={() => onSelectGame('coloring')}
                    delay={0.3}
                />
            </div>
        </motion.div>
    );
};

const GameCard = ({ title, icon: Icon, color, description, onClick, delay, locked }: any) => {
    const colorStyles: Record<string, { card: string; orbital: string }> = {
        amber: { card: 'group-hover:text-amber-400 from-amber-500/20 to-amber-500/5 hover:border-amber-500/50', orbital: 'border-amber-400/30' },
        cyan: { card: 'group-hover:text-cyan-400 from-cyan-500/20 to-cyan-500/5 hover:border-cyan-500/50', orbital: 'border-cyan-400/30' },
        fuchsia: { card: 'group-hover:text-fuchsia-400 from-fuchsia-500/20 to-fuchsia-500/5 hover:border-fuchsia-500/50', orbital: 'border-fuchsia-400/30' },
        violet: { card: 'group-hover:text-indigo-400 from-indigo-500/20 to-indigo-500/5 hover:border-indigo-500/50', orbital: 'border-indigo-400/30' },
        indigo: { card: 'group-hover:text-indigo-400 from-indigo-500/20 to-indigo-500/5 hover:border-indigo-500/50', orbital: 'border-indigo-400/30' },
    };

    const styles = colorStyles[color] || colorStyles.indigo;
    const activeStyle = styles.card;

    return (
        <motion.button
            initial={{ opacity: 0, y: 50, rotateX: 10 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay, type: "spring" }}
            whileHover={!locked ? { y: -20, scale: 1.05, rotateX: 5, zIndex: 10 } : {}}
            whileTap={!locked ? { scale: 0.95 } : {}}
            onClick={onClick}
            disabled={locked}
            className={`group relative w-full h-80 md:w-72 md:h-96 rounded-[32px] bg-white/70 border border-purple-200 backdrop-blur-md shadow-lg flex flex-col items-center justify-between p-8 transition-all duration-500 ${!locked ? activeStyle : 'opacity-60 grayscale cursor-not-allowed'}`}
        >
            {/* Background Glow */}
            <div className={`absolute inset-0 bg-gradient-to-b ${activeStyle.split(' ')[1]} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[32px]`} />

            {/* Icon Floating */}
            <div className="relative mt-8">
                <div className={`w-24 h-24 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500 ${locked ? '' : 'animate-float'}`}>
                    <Icon size={40} className="text-slate-600 group-hover:text-purple-600 transition-colors" />
                </div>
                {/* Orbital Ring */}
                {!locked && (
                    <div className={`absolute inset-0 rounded-full border ${styles.orbital} scale-125 opacity-0 group-hover:opacity-100 transition-all duration-700 animate-spin-slow`} />
                )}
            </div>

            <div className="relative text-center z-10 hidden md:block">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
            </div>
            <div className="relative text-center z-10 md:hidden">
                <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
            </div>

            <div className="relative pt-4">
                {locked ? (
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                        <Lock size={12} /> Brzy
                    </div>
                ) : (
                    <div className="w-12 h-1 bg-purple-200 rounded-full group-hover:w-24 group-hover:bg-purple-400 transition-all duration-500" />
                )}
            </div>
        </motion.button>
    );
};
