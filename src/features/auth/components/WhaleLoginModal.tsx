import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Auth } from './Auth';

interface WhaleLoginModalProps {
    onClose: () => void;
}

interface Star {
    x: number;
    y: number;
    size: number;
    opacity: number;
    delay: number;
}

interface Fish {
    emoji: string;
    top: number;
    duration: number;
    delay: number;
    direction: 'left' | 'right';
}

interface Bubble {
    id: number;
    x: number;
    size: number;
    delay: number;
}

const ASLEEP_BODY = '#2a7fa8';
const ASLEEP_BELLY = '#4ab8d8';
const AWAKE_BODY = '#5dd8f8';
const AWAKE_BELLY = '#a8eeff';

export const WhaleLoginModal = ({ onClose }: WhaleLoginModalProps) => {
    const [isAwake, setIsAwake] = useState(false);
    const [showAuth, setShowAuth] = useState(false);

    const stars = useMemo<Star[]>(() =>
        Array.from({ length: 60 }, () => ({
            x: Math.random() * 100,
            y: Math.random() * 50,
            size: Math.random() * 2 + 0.5,
            opacity: Math.random() * 0.7 + 0.3,
            delay: Math.random() * 3,
        })), []);

    const fish = useMemo<Fish[]>(() => [
        { emoji: '🐠', top: 70, duration: 18, delay: 0, direction: 'right' },
        { emoji: '🐟', top: 80, duration: 22, delay: 4, direction: 'left' },
        { emoji: '🐡', top: 65, duration: 20, delay: 8, direction: 'right' },
        { emoji: '🦈', top: 85, duration: 25, delay: 12, direction: 'left' },
    ], []);

    const bubbles = useMemo<Bubble[]>(() => [
        { id: 0, x: -10, size: 6, delay: 0 },
        { id: 1, x: 15, size: 4, delay: 0.3 },
        { id: 2, x: -5, size: 8, delay: 0.6 },
        { id: 3, x: 20, size: 5, delay: 0.9 },
        { id: 4, x: 5, size: 3, delay: 1.2 },
    ], []);

    const handleWhaleClick = () => {
        if (isAwake) return;
        setIsAwake(true);
        setTimeout(() => setShowAuth(true), 500);
    };

    const bodyColor = isAwake ? AWAKE_BODY : ASLEEP_BODY;
    const bellyColor = isAwake ? AWAKE_BELLY : ASLEEP_BELLY;

    return (
        <motion.div
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-y-auto overflow-x-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {/* Background */}
            <motion.div
                className="absolute inset-0"
                animate={{ backgroundColor: isAwake ? '#0d2a4a' : '#0a1628' }}
                transition={{ duration: 1.2 }}
            />

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

            {/* Drifting Fish */}
            {fish.map((f, i) => (
                <motion.div
                    key={i}
                    className="absolute text-2xl pointer-events-none select-none"
                    style={{
                        top: `${f.top}%`,
                        [f.direction === 'right' ? 'left' : 'right']: '-40px',
                        scaleX: f.direction === 'left' ? -1 : 1,
                    }}
                    animate={{
                        x: f.direction === 'right' ? [0, window.innerWidth + 80] : [0, -(window.innerWidth + 80)],
                        y: [0, -15, 0, 10, 0],
                    }}
                    transition={{
                        x: { duration: f.duration, repeat: Infinity, delay: f.delay, ease: 'linear' },
                        y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
                    }}
                >
                    {f.emoji}
                </motion.div>
            ))}

            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
            >
                <X size={20} />
            </button>

            {/* Main Container — col on mobile, row on md+ */}
            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-center md:gap-12 px-4 py-8">
                {/* Whale Section */}
                <div className="flex flex-col items-center flex-shrink-0">
                    {/* Hint Text */}
                    <AnimatePresence>
                        {!isAwake && (
                            <motion.p
                                className="text-white/80 text-lg font-medium mb-6 select-none"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: [0.6, 1, 0.6], y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{
                                    opacity: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                                    y: { duration: 0.4 },
                                }}
                            >
                                ✨ Pohlaď velrybu ✨
                            </motion.p>
                        )}
                    </AnimatePresence>

                    {/* Whale SVG with float animation */}
                    <motion.div
                        className="cursor-pointer select-none"
                        onClick={handleWhaleClick}
                        animate={{
                            y: [-14, 0, -14],
                            rotate: [-1, 1, -1],
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.97 }}
                        style={{
                            filter: isAwake
                                ? 'drop-shadow(0 0 20px rgba(93,216,248,0.6))'
                                : 'drop-shadow(0 0 8px rgba(42,127,168,0.3))',
                        }}
                    >
                        <svg width="260" height="200" viewBox="0 0 260 200">
                            {/* Tail fin top */}
                            <motion.path
                                d="M210 110 Q240 80 255 65 Q250 85 255 105 Q240 100 210 115 Z"
                                animate={{ fill: bodyColor }}
                                transition={{ duration: 0.8 }}
                            />
                            {/* Tail fin bottom */}
                            <motion.path
                                d="M210 115 Q240 120 255 135 Q240 125 255 105 Q240 110 210 115 Z"
                                animate={{ fill: bodyColor }}
                                transition={{ duration: 0.8 }}
                            />
                            {/* Body */}
                            <motion.ellipse
                                cx="115" cy="112" rx="100" ry="62"
                                animate={{ fill: bodyColor }}
                                transition={{ duration: 0.8 }}
                            />
                            {/* Belly */}
                            <motion.ellipse
                                cx="110" cy="125" rx="68" ry="36"
                                animate={{ fill: bellyColor }}
                                transition={{ duration: 0.8 }}
                            />
                            {/* Dorsal fin */}
                            <motion.path
                                d="M100 55 Q115 30 135 50 Q120 52 105 65 Z"
                                animate={{ fill: bodyColor }}
                                transition={{ duration: 0.8 }}
                            />
                            {/* Pectoral fin */}
                            <motion.path
                                d="M60 130 Q35 155 30 175 Q50 158 75 145 Z"
                                animate={{ fill: bodyColor }}
                                transition={{ duration: 0.8 }}
                            />
                            {/* Eye white */}
                            <circle cx="62" cy="95" r="14" fill="white" opacity={0.95} />
                            {/* Eye pupil */}
                            <circle cx="65" cy="93" r="8" fill="#0a2040" />
                            {/* Eye glint */}
                            <circle cx="68" cy="90" r="3" fill="white" opacity={0.9} />
                            {/* Eye glint small */}
                            <circle cx="61" cy="96" r="1.5" fill="white" opacity={0.6} />
                            {/* Smile */}
                            <path d="M45 110 Q62 122 80 112" stroke="#0a2040" strokeWidth={2.5} fill="none" strokeLinecap="round" />
                        </svg>

                        {/* Bubbles (awake only) */}
                        <AnimatePresence>
                            {isAwake && bubbles.map((b) => (
                                <motion.div
                                    key={b.id}
                                    className="absolute rounded-full border border-white/40 bg-white/10"
                                    style={{
                                        width: b.size,
                                        height: b.size,
                                        left: `calc(50% + ${b.x}px)`,
                                        top: '30%',
                                    }}
                                    initial={{ opacity: 0, y: 0 }}
                                    animate={{ opacity: [0, 0.8, 0], y: -80 }}
                                    transition={{
                                        duration: 2,
                                        delay: b.delay,
                                        repeat: Infinity,
                                        ease: 'easeOut',
                                    }}
                                />
                            ))}
                        </AnimatePresence>
                    </motion.div>
                </div>

                {/* Auth Form (after awakening) */}
                <AnimatePresence>
                    {showAuth && (
                        <motion.div
                            className="mt-8 md:mt-0 w-full max-w-sm"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            {/*
                              Auth.tsx renders as fixed inset-0 z-[100] overlay.
                              We neutralize its positioning via inline style override on a wrapper
                              so it flows inline within the whale scene.
                            */}
                            <div
                                style={{ position: 'relative', zIndex: 10 }}
                                className="[&>div]:!static [&>div]:!inset-auto [&>div]:!z-auto [&>div]:!p-0 [&>div>div:first-child]:!hidden"
                            >
                                <Auth onLogin={onClose} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};
