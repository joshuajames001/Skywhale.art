const SVG_KEYFRAMES = `
@keyframes svgFlyAcross { 0% { transform: translateX(-120%) translateY(0); } 100% { transform: translateX(120vw) translateY(-30px); } }
@keyframes svgSway { 0%, 100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }
@keyframes svgSwimRight { 0% { transform: translateX(-150px); } 100% { transform: translateX(calc(100vw + 150px)); } }
@keyframes svgSwimLeft { 0% { transform: translateX(calc(100vw + 100px)); } 100% { transform: translateX(-150px); } }
@keyframes svgBubbleUp { 0% { transform: translateY(0) scale(1); opacity: 0.4; } 100% { transform: translateY(-80vh) scale(0.5); opacity: 0; } }
@keyframes svgLeafFall { 0% { transform: translateY(-40px) translateX(0) rotate(0deg); opacity: 0; } 10% { opacity: 0.5; } 100% { transform: translateY(100vh) translateX(60px) rotate(240deg); opacity: 0; } }
@keyframes svgButterfly { 0% { transform: translate(0, 0) rotate(0deg); } 25% { transform: translate(15vw, -8vh) rotate(5deg); } 50% { transform: translate(30vw, 2vh) rotate(-3deg); } 75% { transform: translate(45vw, -5vh) rotate(4deg); } 100% { transform: translate(60vw, 0) rotate(0deg); } }
@keyframes svgSnowfall { 0% { transform: translateY(-20px) translateX(0); opacity: 0; } 10% { opacity: 0.6; } 100% { transform: translateY(100vh) translateX(40px); opacity: 0; } }
@keyframes svgAurora { 0%, 100% { opacity: 0.15; } 50% { opacity: 0.35; } }
@keyframes svgBirdFly { 0% { transform: translateX(-80px); } 100% { transform: translateX(calc(100vw + 80px)); } }
@keyframes svgGrassSway { 0%, 100% { transform: skewX(-3deg); } 50% { transform: skewX(3deg); } }
@keyframes svgComet { 0% { transform: translate(-100px, 100px); opacity: 0; } 10% { opacity: 0.8; } 90% { opacity: 0.6; } 100% { transform: translate(110vw, -50vh); opacity: 0; } }
@keyframes svgSunPulse { 0%, 100% { opacity: 0.25; r: 40; } 50% { opacity: 0.35; r: 45; } }
`;

const DinosauriSVG = () => (
    <>
        {/* Ferns at bottom */}
        <svg className="absolute bottom-0 left-[5%] w-24 h-40 opacity-30" viewBox="0 0 100 160" style={{ animation: 'svgSway 4s ease-in-out infinite' }}>
            <path d="M50 160 Q45 120 30 100 Q15 85 5 70 Q20 80 35 90 Q40 70 25 50 Q15 35 10 20 Q25 35 40 55 Q45 40 35 20 Q50 40 50 60 Q50 40 65 20 Q55 40 55 60 Q60 55 75 35 Q65 50 55 70 Q65 80 80 90 Q85 85 95 70 Q80 85 70 100 Q55 120 50 160Z" fill="#22c55e" />
        </svg>
        <svg className="absolute bottom-0 right-[8%] w-20 h-32 opacity-25" viewBox="0 0 100 160" style={{ animation: 'svgSway 5s ease-in-out infinite', animationDelay: '1s' }}>
            <path d="M50 160 Q45 120 30 100 Q15 85 5 70 Q20 80 35 90 Q40 70 25 50 Q15 35 10 20 Q25 35 40 55 Q45 40 35 20 Q50 40 50 60 Q50 40 65 20 Q55 40 55 60 Q60 55 75 35 Q65 50 55 70 Q65 80 80 90 Q85 85 95 70 Q80 85 70 100 Q55 120 50 160Z" fill="#16a34a" />
        </svg>
        <svg className="absolute bottom-0 left-[40%] w-16 h-28 opacity-20" viewBox="0 0 100 160" style={{ animation: 'svgSway 3.5s ease-in-out infinite', animationDelay: '2s' }}>
            <path d="M50 160 Q48 130 40 110 Q30 95 20 85 Q35 90 45 100 Q42 80 30 60 Q45 75 50 90 Q55 75 70 60 Q58 80 55 100 Q65 90 80 85 Q70 95 60 110 Q52 130 50 160Z" fill="#15803d" />
        </svg>
        {/* Flying pterodactyl */}
        <svg className="absolute top-[15%] opacity-20" viewBox="0 0 120 40" width="80" style={{ animation: 'svgFlyAcross 20s linear infinite' }}>
            <path d="M60 20 L20 5 L0 0 L25 15 L60 20 L95 15 L120 0 L100 5 Z M55 20 L60 35 L65 20Z" fill="#22c55e" />
        </svg>
        {/* Footprints */}
        {[15, 30, 50, 70].map((x, i) => (
            <svg key={i} className="absolute bottom-6 opacity-10" style={{ left: `${x}%` }} width="16" height="20" viewBox="0 0 16 20">
                <ellipse cx="8" cy="6" rx="5" ry="6" fill="#22c55e" />
                <circle cx="4" cy="15" r="2" fill="#22c55e" />
                <circle cx="12" cy="15" r="2" fill="#22c55e" />
                <circle cx="8" cy="18" r="1.5" fill="#22c55e" />
            </svg>
        ))}
    </>
);

const VesmirSVG = () => (
    <>
        {/* Stars field */}
        {Array.from({ length: 35 }).map((_, i) => {
            const s = 1 + (i % 3);
            const x = ((i * 37 + 13) % 97);
            const y = ((i * 53 + 7) % 93);
            const delay = (i * 0.3) % 4;
            const dur = 2 + (i % 3);
            return (
                <svg key={i} className="absolute" style={{ left: `${x}%`, top: `${y}%`, animation: `twinkle ${dur}s ${delay}s infinite ease-in-out` }} width={s * 2} height={s * 2} viewBox="0 0 10 10">
                    <circle cx="5" cy="5" r="4" fill="white" opacity="0.7" />
                </svg>
            );
        })}
        {/* Comet */}
        <svg className="absolute top-[20%] opacity-40" viewBox="0 0 100 10" width="80" style={{ animation: 'svgComet 8s linear infinite', animationDelay: '2s' }}>
            <defs><linearGradient id="comet-tail" x1="0" x2="1"><stop offset="0%" stopColor="white" stopOpacity="0" /><stop offset="100%" stopColor="white" stopOpacity="0.8" /></linearGradient></defs>
            <rect x="0" y="4" width="90" height="2" rx="1" fill="url(#comet-tail)" />
            <circle cx="95" cy="5" r="4" fill="white" />
        </svg>
        {/* Nebula */}
        <div className="absolute top-[30%] left-[60%] w-64 h-40 rounded-full opacity-10" style={{ background: 'radial-gradient(ellipse, #7c3aed 0%, transparent 70%)', filter: 'blur(40px)' }} />
    </>
);

const OceanSVG = () => (
    <>
        {/* Seaweed at bottom */}
        {[8, 20, 75, 88].map((x, i) => (
            <svg key={`weed-${i}`} className="absolute bottom-0 opacity-30" style={{ left: `${x}%`, animation: `svgSway ${3 + i * 0.5}s ease-in-out infinite`, animationDelay: `${i * 0.7}s`, transformOrigin: 'bottom center' }} width="20" height={80 + i * 15} viewBox="0 0 20 120">
                <path d={`M10 120 Q5 90 8 70 Q12 50 7 30 Q4 15 10 0 Q16 15 13 30 Q8 50 12 70 Q15 90 10 120Z`} fill="#0ea5e9" />
            </svg>
        ))}
        {/* Fish swimming right */}
        <svg className="absolute top-[35%] opacity-25" viewBox="0 0 50 20" width="40" style={{ animation: 'svgSwimRight 12s linear infinite' }}>
            <ellipse cx="25" cy="10" rx="18" ry="7" fill="#38bdf8" />
            <polygon points="5,10 -5,3 -5,17" fill="#38bdf8" />
            <circle cx="35" cy="8" r="2" fill="#000" opacity="0.5" />
        </svg>
        {/* Fish swimming left (smaller) */}
        <svg className="absolute top-[55%] opacity-20" viewBox="0 0 50 20" width="30" style={{ animation: 'svgSwimLeft 15s linear infinite', animationDelay: '3s' }}>
            <ellipse cx="25" cy="10" rx="18" ry="7" fill="#0ea5e9" />
            <polygon points="45,10 55,3 55,17" fill="#0ea5e9" />
            <circle cx="15" cy="8" r="2" fill="#000" opacity="0.5" />
        </svg>
        {/* Bubbles */}
        {[25, 45, 65, 80].map((x, i) => (
            <svg key={`bub-${i}`} className="absolute opacity-25" style={{ left: `${x}%`, bottom: '10%', animation: `svgBubbleUp ${6 + i * 2}s ${i * 1.5}s infinite ease-out` }} width={8 + i * 3} height={8 + i * 3} viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="8" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
                <circle cx="7" cy="7" r="2" fill="#38bdf8" opacity="0.4" />
            </svg>
        ))}
    </>
);

const PralesSVG = () => (
    <>
        {/* Tree silhouettes on edges */}
        <svg className="absolute bottom-0 left-0 opacity-20" width="120" height="300" viewBox="0 0 120 300">
            <path d="M60 300 L60 180 Q30 160 15 120 Q0 80 20 50 Q35 25 60 10 Q85 25 100 50 Q120 80 105 120 Q90 160 60 180Z" fill="#16a34a" />
            <rect x="55" y="180" width="10" height="120" fill="#15803d" />
        </svg>
        <svg className="absolute bottom-0 right-0 opacity-15" width="100" height="260" viewBox="0 0 120 300">
            <path d="M60 300 L60 200 Q35 180 20 150 Q5 115 25 80 Q40 55 60 40 Q80 55 95 80 Q115 115 100 150 Q85 180 60 200Z" fill="#15803d" />
            <rect x="55" y="200" width="10" height="100" fill="#14532d" />
        </svg>
        {/* Falling leaves */}
        {[15, 35, 55, 72, 88].map((x, i) => (
            <svg key={`leaf-${i}`} className="absolute opacity-30" style={{ left: `${x}%`, top: '-5%', animation: `svgLeafFall ${10 + i * 2}s ${i * 2}s infinite linear` }} width="14" height="18" viewBox="0 0 14 18">
                <path d="M7 0 Q12 4 13 9 Q12 14 7 18 Q2 14 1 9 Q2 4 7 0Z" fill={i % 2 === 0 ? '#4ade80' : '#22c55e'} />
                <line x1="7" y1="2" x2="7" y2="16" stroke="#15803d" strokeWidth="0.5" />
            </svg>
        ))}
        {/* Butterfly */}
        <svg className="absolute top-[25%] left-[5%] opacity-30" viewBox="0 0 30 20" width="24" style={{ animation: 'svgButterfly 8s ease-in-out infinite' }}>
            <ellipse cx="15" cy="10" rx="2" ry="1" fill="#a855f7" />
            <ellipse cx="10" cy="7" rx="6" ry="5" fill="#c084fc" opacity="0.7" />
            <ellipse cx="20" cy="7" rx="6" ry="5" fill="#c084fc" opacity="0.7" />
            <ellipse cx="10" cy="13" rx="4" ry="4" fill="#a855f7" opacity="0.5" />
            <ellipse cx="20" cy="13" rx="4" ry="4" fill="#a855f7" opacity="0.5" />
        </svg>
    </>
);

const ArktidaSVG = () => (
    <>
        {/* Aurora borealis */}
        <div className="absolute top-0 left-[10%] right-[10%] h-[30%] opacity-20 rounded-b-full" style={{ background: 'linear-gradient(135deg, #22d3ee44, #34d39944, #22d3ee22, transparent)', filter: 'blur(30px)', animation: 'svgAurora 6s ease-in-out infinite' }} />
        {/* Snowflakes */}
        {Array.from({ length: 18 }).map((_, i) => {
            const x = ((i * 41 + 11) % 95);
            const size = 4 + (i % 4) * 2;
            const dur = 7 + (i % 5) * 2;
            const delay = (i * 0.8) % 6;
            return (
                <svg key={i} className="absolute opacity-40" style={{ left: `${x}%`, top: '-3%', animation: `svgSnowfall ${dur}s ${delay}s infinite linear` }} width={size} height={size} viewBox="0 0 20 20">
                    <line x1="10" y1="0" x2="10" y2="20" stroke="#bae6fd" strokeWidth="1" />
                    <line x1="0" y1="10" x2="20" y2="10" stroke="#bae6fd" strokeWidth="1" />
                    <line x1="3" y1="3" x2="17" y2="17" stroke="#bae6fd" strokeWidth="0.8" />
                    <line x1="17" y1="3" x2="3" y2="17" stroke="#bae6fd" strokeWidth="0.8" />
                </svg>
            );
        })}
        {/* Ice crystals in corners */}
        <svg className="absolute bottom-0 left-0 opacity-15" width="120" height="100" viewBox="0 0 120 100">
            <polygon points="0,100 30,60 10,40 40,50 60,20 50,50 80,40 70,60 120,80 70,80 60,100" fill="#bae6fd" />
        </svg>
        <svg className="absolute bottom-0 right-0 opacity-10" width="100" height="80" viewBox="0 0 100 80" style={{ transform: 'scaleX(-1)' }}>
            <polygon points="0,80 25,50 10,35 35,42 50,15 45,42 70,35 60,50 100,65 60,65 50,80" fill="#e0f2fe" />
        </svg>
    </>
);

const SavanaSVG = () => (
    <>
        {/* Grass at bottom */}
        <svg className="absolute bottom-0 left-0 right-0 opacity-25" height="50" viewBox="0 0 400 50" preserveAspectRatio="none" style={{ width: '100%', animation: 'svgGrassSway 4s ease-in-out infinite', transformOrigin: 'bottom center' }}>
            {Array.from({ length: 40 }).map((_, i) => (
                <line key={i} x1={i * 10 + 2} y1="50" x2={i * 10 + 5 + (i % 3) * 2} y2={15 + (i % 4) * 8} stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" />
            ))}
        </svg>
        {/* Birds */}
        {[20, 45, 70].map((x, i) => (
            <svg key={`bird-${i}`} className="absolute opacity-20" style={{ left: `${x}%`, top: `${12 + i * 5}%`, animation: `svgBirdFly ${10 + i * 3}s ${i * 3}s linear infinite` }} width="24" height="12" viewBox="0 0 24 12">
                <path d="M0 8 Q6 0 12 6 Q18 0 24 8" fill="none" stroke="#fbbf24" strokeWidth="1.5" />
            </svg>
        ))}
        {/* Sun glow */}
        <svg className="absolute top-[8%] right-[15%] opacity-25" width="90" height="90" viewBox="0 0 100 100">
            <defs><radialGradient id="sun-glow"><stop offset="0%" stopColor="#fbbf24" stopOpacity="0.6" /><stop offset="100%" stopColor="#fbbf24" stopOpacity="0" /></radialGradient></defs>
            <circle cx="50" cy="50" r="45" fill="url(#sun-glow)" style={{ animation: 'svgSunPulse 5s ease-in-out infinite' }} />
            <circle cx="50" cy="50" r="15" fill="#fbbf24" opacity="0.4" />
        </svg>
    </>
);

const SVG_SCENES: Record<string, () => JSX.Element> = {
    dinosauri: DinosauriSVG,
    vesmir: VesmirSVG,
    ocean: OceanSVG,
    prales: PralesSVG,
    arktida: ArktidaSVG,
    savana: SavanaSVG,
};

export const WorldSVGBackground = ({ slug }: { slug: string }) => {
    const Scene = SVG_SCENES[slug];
    if (!Scene) return null;

    return (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <style>{SVG_KEYFRAMES}</style>
            <Scene />
        </div>
    );
};
