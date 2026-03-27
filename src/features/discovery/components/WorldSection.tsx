import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { DiscoveryCategory } from '../../../types/discovery';
import { WorldSVGBackground } from './WorldSVGBackground';
import { WORLD_ICONS } from './WorldIcons';

interface WorldSectionProps {
    category: DiscoveryCategory;
    index: number;
    onClick: () => void;
}

export const WORLD_BACKGROUNDS: Record<string, string> = {
    dinosauri: 'radial-gradient(ellipse at center, #1a3a1a 0%, #0d1f0d 40%, #000 100%)',
    vesmir: 'radial-gradient(ellipse at top, #1a0a2e 0%, #0a0015 50%, #000 100%)',
    ocean: 'radial-gradient(ellipse at bottom, #001a3a 0%, #000d1f 40%, #000 100%)',
    prales: 'radial-gradient(ellipse at center, #0d2a0d 0%, #071507 40%, #000 100%)',
    arktida: 'radial-gradient(ellipse at top, #0a1a2a 0%, #050d15 40%, #000 100%)',
    savana: 'radial-gradient(ellipse at bottom, #2a1a00 0%, #150d00 40%, #000 100%)',
};

// ─── Particle configs per slug ───────────────────────────────────────────
type ParticleStyle = 'drift' | 'twinkle' | 'rise' | 'fall' | 'snow' | 'wind';

interface ParticleConfig {
    color: string;
    style: ParticleStyle;
    count: number;
    sizeRange: [number, number];
}

const PARTICLE_CONFIGS: Record<string, ParticleConfig> = {
    dinosauri: { color: '#22c55e', style: 'drift', count: 10, sizeRange: [3, 6] },
    vesmir: { color: '#ffffff', style: 'twinkle', count: 12, sizeRange: [1, 3] },
    ocean: { color: '#38bdf8', style: 'rise', count: 10, sizeRange: [3, 6] },
    prales: { color: '#4ade80', style: 'fall', count: 10, sizeRange: [2, 5] },
    arktida: { color: '#e0f2fe', style: 'snow', count: 12, sizeRange: [2, 5] },
    savana: { color: '#fbbf24', style: 'wind', count: 8, sizeRange: [2, 4] },
};

const KEYFRAMES: Record<ParticleStyle, string> = {
    drift: `@keyframes drift { 0% { transform: translate(0, 0); opacity: 0.3; } 50% { transform: translate(20px, -30px); opacity: 0.15; } 100% { transform: translate(0, 0); opacity: 0.3; } }`,
    twinkle: `@keyframes twinkle { 0%, 100% { opacity: 0; transform: scale(0.5); } 50% { opacity: 0.8; transform: scale(1.2); } }`,
    rise: `@keyframes rise { 0% { transform: translateY(0) scale(1); opacity: 0.4; } 100% { transform: translateY(-100vh) scale(0.3); opacity: 0; } }`,
    fall: `@keyframes fall { 0% { transform: translateY(-20px) translateX(0) rotate(0deg); opacity: 0; } 10% { opacity: 0.3; } 90% { opacity: 0.2; } 100% { transform: translateY(100vh) translateX(40px) rotate(180deg); opacity: 0; } }`,
    snow: `@keyframes snow { 0% { transform: translateY(-10px) translateX(0); opacity: 0; } 10% { opacity: 0.5; } 90% { opacity: 0.3; } 100% { transform: translateY(100vh) translateX(30px); opacity: 0; } }`,
    wind: `@keyframes wind { 0% { transform: translateX(0) translateY(0); opacity: 0.3; } 50% { transform: translateX(60px) translateY(-10px); opacity: 0.15; } 100% { transform: translateX(0) translateY(0); opacity: 0.3; } }`,
};

const ANIMATION_DURATIONS: Record<ParticleStyle, [number, number]> = {
    drift: [6, 10],
    twinkle: [2, 5],
    rise: [6, 12],
    fall: [8, 14],
    snow: [7, 13],
    wind: [5, 9],
};

const seededRandom = (seed: number) => {
    const x = Math.sin(seed * 9301 + 49297) * 49297;
    return x - Math.floor(x);
};

const Particles = ({ slug }: { slug: string }) => {
    const config = PARTICLE_CONFIGS[slug];
    const { color, style, count, sizeRange } = config ?? { color: '', style: 'drift' as const, count: 0, sizeRange: [0, 0] as [number, number] };
    const [durMin, durMax] = ANIMATION_DURATIONS[style] ?? [0, 0];

    const particles = useMemo(() =>
        Array.from({ length: count }).map((_, i) => {
            const r = (n: number) => seededRandom(i * 100 + n);
            const size = sizeRange[0] + r(1) * (sizeRange[1] - sizeRange[0]);
            return {
                left: `${r(2) * 100}%`,
                top: `${r(3) * 100}%`,
                width: `${size}px`,
                height: `${size}px`,
                animationDelay: `${r(4) * durMax}s`,
                animationDuration: `${durMin + r(5) * (durMax - durMin)}s`,
            };
        }),
    [slug, count, sizeRange, durMin, durMax]);

    if (!config) return null;

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <style>{KEYFRAMES[style]}</style>
            {particles.map((p, i) => (
                <div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                        ...p,
                        backgroundColor: color,
                        animation: `${style} ${p.animationDuration} ${p.animationDelay} infinite ease-in-out`,
                    }}
                />
            ))}
        </div>
    );
};

export const WorldSection = ({ category, index, onClick }: WorldSectionProps) => {
    const { t } = useTranslation();
    const color = category.theme_color_hex;
    const bg = WORLD_BACKGROUNDS[category.slug] ?? `radial-gradient(ellipse at center, ${color}44 0%, ${color}11 40%, #000 70%)`;
    const IconComponent = WORLD_ICONS[category.slug];

    return (
        <section
            className="h-screen w-full snap-start relative flex items-center justify-center overflow-hidden"
            style={{ background: bg }}
        >
            <WorldSVGBackground slug={category.slug} />
            <Particles slug={category.slug} />

            <div
                className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
                style={{ background: 'linear-gradient(to bottom, transparent, #000)' }}
            />

            <motion.div
                className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.5 }}
                transition={{ duration: 0.6, delay: 0.1 }}
            >
                {/* World icon */}
                <motion.div
                    className="w-24 h-24 md:w-32 md:h-32 mb-6 drop-shadow-lg"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                    {IconComponent ? <IconComponent /> : <span className="text-7xl">🌍</span>}
                </motion.div>

                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 md:w-64 md:h-64 rounded-full blur-3xl pointer-events-none -z-10"
                    style={{ backgroundColor: color, opacity: 0.15 }}
                />

                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-4">
                    {category.title}
                </h2>

                <p className="text-base md:text-lg text-white/60 leading-relaxed mb-8">
                    {category.description}
                </p>

                <motion.button
                    onClick={onClick}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 rounded-full border border-white/30 text-white font-medium hover:bg-white/10 transition-colors backdrop-blur-sm"
                    style={{ boxShadow: `0 0 30px ${color}33` }}
                >
                    {t('discovery.explore_button', 'Prozkoumat')} →
                </motion.button>
            </motion.div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/20 text-xs font-mono tracking-widest">
                {String(index + 1).padStart(2, '0')}
            </div>
        </section>
    );
};
