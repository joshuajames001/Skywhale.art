import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WelcomeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Star {
    x: number;
    y: number;
    size: number;
    opacity: number;
    delay: number;
}

export const WelcomeModal = ({ isOpen, onClose }: WelcomeModalProps) => {
    const navigate = useNavigate();

    const stars = useMemo<Star[]>(() =>
        Array.from({ length: 40 }, () => ({
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 2 + 0.5,
            opacity: Math.random() * 0.7 + 0.3,
            delay: Math.random() * 3,
        })), []);

    const handleCreateStory = () => {
        onClose();
        navigate('/custom?pages=3');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {/* Ocean background */}
                    <div className="absolute inset-0 bg-[#0a1628]" />

                    {/* Stars */}
                    {stars.map((star, i) => (
                        <motion.div
                            key={i}
                            className="absolute rounded-full bg-white"
                            style={{
                                left: `${star.x}%`,
                                top: `${star.y}%`,
                                width: star.size,
                                height: star.size,
                            }}
                            animate={{ opacity: [star.opacity, star.opacity * 0.3, star.opacity] }}
                            transition={{ duration: 2 + star.delay, repeat: Infinity, ease: 'easeInOut' }}
                        />
                    ))}

                    {/* Backdrop click to dismiss */}
                    <div className="absolute inset-0" onClick={onClose} />

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>

                    {/* Card */}
                    <motion.div
                        className="relative z-10 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full text-center"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                    >
                        {/* Title */}
                        <h2 className="text-2xl font-bold text-white mb-3">
                            Vítej v Skywhale! 🎉
                        </h2>

                        {/* Description */}
                        <p className="text-white/70 mb-6">
                            Dostáváš 160 energie — dost na tvůj první příběh.
                        </p>

                        {/* Energy Badge */}
                        <motion.div
                            className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 text-amber-300 px-5 py-2.5 rounded-full mb-8"
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        >
                            <Zap size={20} className="fill-amber-400 text-amber-400" />
                            <span className="text-lg font-bold">160</span>
                        </motion.div>

                        {/* CTA */}
                        <button
                            onClick={handleCreateStory}
                            className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-lg hover:from-purple-500 hover:to-blue-500 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-500/25 mb-3"
                        >
                            Vytvořit první příběh 🐋
                        </button>

                        {/* Dismiss */}
                        <button
                            onClick={onClose}
                            className="text-white/40 hover:text-white/70 text-sm transition-colors"
                        >
                            Prozkoumám nejdřív sám
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
