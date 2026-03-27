import { useState, useEffect, useRef } from 'react';
import { DiscoveryPage } from '../../../types/discovery';
import { X, Volume2, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDiscoveryHotspots } from '../hooks/useDiscoveryHotspots';
import { TEXTURE_URL, PAGE_LABEL } from '../constants';

export const DiscoveryPageView = ({ page, isDino, isSpace, onPageComplete }: { page: DiscoveryPage; isDino?: boolean; isSpace?: boolean; onPageComplete?: () => void }) => {
    const { hotspots } = useDiscoveryHotspots(page?.id ?? '');
    const [activeHotspot, setActiveHotspot] = useState<typeof hotspots[number] | null>(null);

    // AUDIO STATE
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Reset active hotspot when page changes
    useEffect(() => { setActiveHotspot(null); }, [page?.id]);

    // Handle Audio
    useEffect(() => {
        // Cleanup previous audio hooks
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);

        if (page?.audio_url) {
            const audio = new Audio(page.audio_url);

            audio.onplay = () => setIsPlaying(true);
            audio.onpause = () => setIsPlaying(false);

            // Auto-turn on end
            audio.onended = () => {
                setIsPlaying(false);
                setCurrentTime(0);
                if (onPageComplete) onPageComplete();
            };

            audio.ontimeupdate = () => setCurrentTime(audio.currentTime);
            audio.onloadedmetadata = () => setDuration(audio.duration);

            audioRef.current = audio;

            // AUTO PLAY with User Interaction Safety
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log("Auto-play prevented:", error);
                    setIsPlaying(false);
                });
            }
        }

        const handleStopAll = () => { audioRef.current?.pause(); };
        window.addEventListener('discovery:stop-audio', handleStopAll);

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
            }
            window.removeEventListener('discovery:stop-audio', handleStopAll);
        };
    }, [page?.audio_url, onPageComplete]);

    const toggleAudio = () => {
        if (!audioRef.current) return;
        if (isPlaying) { audioRef.current.pause(); } else { audioRef.current.play(); }
        setIsPlaying(!isPlaying);
    };

    // GUARD CLAUSE — after all hooks
    if (!page) return null;

    // Determine Layout Mode
    const layout = isSpace ? 'cinematic' : 'book';
    const isCinematic = layout === 'cinematic';
    const isVideo = page.image_url?.toLowerCase().includes('.mp4');

    // --- LAYOUT CONFIGURATION ---
    // CONTAINER CLASSES
    // Cinematic: Block (Full wrapper). Book: Flex Row (Split).
    const containerClasses = isCinematic
        ? "w-full h-full relative shadow-2xl overflow-hidden md:rounded-[2rem] group"
        : "w-full h-full flex flex-col md:flex-row shadow-2xl overflow-hidden md:rounded-[2rem]";

    // MEDIA WRAPPER CLASSES (The Box holding the image)
    // Cinematic: Absolute Inset-0 (Full Screen Background). 
    // Book: 1/2 Width Relative Column.
    const mediaWrapperClasses = isCinematic
        ? "absolute inset-0 w-full h-full z-0"
        : "w-full md:w-1/2 h-1/2 md:h-full relative shrink-0 bg-slate-950 flex items-center justify-center p-4 md:p-8 overflow-hidden";

    // VIEWPORT LOCK CLASSES (Only relevant for Book mode to lock 3:4)
    // In Cinematic, we just cover the whole container.
    const viewportClasses = isCinematic
        ? "w-full h-full relative" // Full fill
        : "relative w-full max-h-full aspect-[3/4] shadow-2xl rounded-lg overflow-hidden ring-1 ring-white/10 group";

    // TEXT COLUMN CLASSES
    // Cinematic: Absolute Bottom HUD (Glassmorphism).
    // Book: 1/2 Width Relative Column (Right side).
    const textColumnClasses = isCinematic
        ? "absolute bottom-0 left-0 right-0 max-h-[40%] bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent z-20 p-8 md:p-12 flex flex-col justify-end"
        : "w-full md:w-1/2 h-1/2 md:h-full relative p-6 md:p-12 lg:p-16 flex flex-col justify-start bg-black/20 overflow-y-auto custom-scrollbar z-10";


    return (
        <div className={containerClasses}>

            {/* 1. MEDIA LAYER */}
            <div className={mediaWrapperClasses}>

                {/* Book Mode: Global Ambience */}
                {!isCinematic && (
                    <>
                        <div
                            className="absolute inset-0 scale-125 blur-3xl opacity-30 saturate-150 pointer-events-none"
                            style={{
                                backgroundImage: `url(${page.image_url})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }}
                        />
                        <div className="absolute inset-0 bg-black/20 pointer-events-none" />
                    </>
                )}

                {/* The Viewport / Content */}
                <div className={viewportClasses}>
                    {/* MEDIA CONTENT */}
                    {isVideo ? (
                        <video
                            key={page.image_url}
                            src={page.image_url}
                            autoPlay
                            loop
                            muted
                            playsInline
                            preload="auto"
                            className="w-full h-full object-cover"
                        >
                            Váš prohlížeč nepodporuje přehrávání videa.
                        </video>
                    ) : (
                        <motion.img
                            key={page.image_url}
                            src={page.image_url}
                            alt={page.title}
                            className="w-full h-full object-cover"
                            initial={{ opacity: 0, scale: 1.05 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                        />
                    )}

                    {/* Cinematic Overlay Gradient (Top) */}
                    {isCinematic && (
                        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-10" />
                    )}

                    {/* TEXTURE OVERLAY (Optional cinematic grain) */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-60 pointer-events-none z-10" />

                    {/* HOTSPOTS */}
                    {/* In Cinematic, hotspots are on full screen. In Book, they are in the locked viewport. */}
                    <div className="absolute inset-0 z-50">
                        {hotspots.map((hs) => (
                            <div
                                key={hs.id}
                                className="absolute"
                                style={{ left: `${hs.x_pos}%`, top: `${hs.y_pos}%`, transform: 'translate(-50%, -50%)' }}
                            >
                                <button
                                    onClick={() => setActiveHotspot(activeHotspot?.id === hs.id ? null : hs)}
                                    className={`relative group/hotspot ${activeHotspot?.id === hs.id ? 'z-[60]' : 'z-30'}`}
                                >
                                    <div className="absolute inset-0 bg-white/30 rounded-full animate-ping" />
                                    <div className="relative w-10 h-10 md:w-8 md:h-8 bg-white/30 backdrop-blur-md border border-white/50 rounded-full flex items-center justify-center hover:bg-white/40 transition-all shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                                        <div className="w-3 h-3 md:w-3 md:h-3 bg-white rounded-full shadow-sm" />
                                    </div>
                                </button>

                                {/* POPOVER */}
                                <AnimatePresence>
                                    {activeHotspot?.id === hs.id && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                            className="absolute left-1/2 bottom-full mb-4 -translate-x-1/2 w-[280px] bg-slate-950/95 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl z-50 text-left"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-white font-bold leading-tight">{hs.title}</h3>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setActiveHotspot(null); }}
                                                    className="text-slate-400 hover:text-white p-1"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                            <p className="text-slate-200 text-sm leading-relaxed">{hs.content}</p>
                                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-slate-950/95" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Page number hint */}
                <span className={`absolute bottom-4 left-6 font-serif text-sm text-white/50 z-[60] ${isCinematic ? 'hidden' : ''}`}>
                    {PAGE_LABEL}{page.page_number}
                </span>
            </div>

            {/* 2. TEXT COLUMN (Right or Bottom) */}
            <div className={textColumnClasses}>
                {/* Decoration Texture (Book Mode only) */}
                {!isCinematic && (
                    <div
                        className="absolute inset-0 opacity-10 pointer-events-none"
                        style={{
                            backgroundImage: `url('${TEXTURE_URL}')`,
                            backgroundRepeat: 'repeat'
                        }}
                    />
                )}

                <div className="relative z-10 flex flex-col h-full">

                    {/* HEADER */}
                    <div className="flex items-center justify-between mb-4 md:mb-6 shrink-0">
                        <h2 className="text-2xl md:text-4xl font-black text-white leading-tight font-title drop-shadow-md">
                            {page.title}
                        </h2>

                        {page.audio_url && (
                            <div className="flex flex-col gap-2 relative group/audio shrink-0">
                                <button
                                    onClick={toggleAudio}
                                    className={`
                                            p-3 rounded-full border transition-all duration-300
                                            ${isPlaying
                                            ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.5)]'
                                            : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white'
                                        }
                                        `}
                                >
                                    {isPlaying ? <Pause size={20} /> : <Volume2 size={20} />}
                                </button>
                                {duration > 0 && (
                                    <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-purple-500 transition-all duration-200"
                                            style={{ width: `${(currentTime / duration) * 100}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* SCROLLABLE TEXT AREA */}
                    <div className="overflow-y-auto custom-scrollbar px-1 flex-1">
                        <motion.div
                            className="font-serif text-lg md:text-xl leading-[1.8] text-indigo-50/90 text-justify tracking-wide selection:bg-purple-900/50 pb-20 md:pb-0 drop-shadow-sm"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                        >
                            {page.text_content}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};
