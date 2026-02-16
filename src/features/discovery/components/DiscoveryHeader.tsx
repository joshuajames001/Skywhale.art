import { Compass, ArrowLeft } from 'lucide-react';
import { MiniPlayer } from '../../audio/components/MiniPlayer';
import { useTranslation } from 'react-i18next';
import { DiscoveryView } from '../hooks/useDiscoveryNav';

interface DiscoveryHeaderProps {
    view: DiscoveryView;
    title?: string;
    onBack: () => void;
    showTrailerButton: boolean;
    onPlayTrailer: () => void;
    audioUrl?: string; // For Reader view
    isCustomTheme: boolean; // Dino or Space
}

export const DiscoveryHeader = ({
    view,
    title,
    onBack,
    showTrailerButton,
    onPlayTrailer,
    audioUrl,
    isCustomTheme
}: DiscoveryHeaderProps) => {
    const { t } = useTranslation();

    if (view === 'trailer') return null;

    return (
        <div className={`p-4 md:p-6 flex items-center gap-4 border-b border-white/5 relative z-[70] ${isCustomTheme ? 'bg-transparent' : 'bg-slate-900/50 shadow-lg'} shrink-0`}>
            <button
                onClick={onBack}
                className="p-2 rounded-full hover:bg-white/10 transition-colors text-white"
            >
                <ArrowLeft size={24} />
            </button>
            <div className="flex items-center gap-2 min-w-0 flex-1">
                <Compass className="text-amber-400 shrink-0" size={20} />
                <h1 className="text-base md:text-xl font-bold font-title truncate text-white">
                    {view === 'categories' ? t('discovery.title') : title}
                </h1>

                {/* PLAY TRAILER BUTTON (Only in book-list if trailer exists) */}
                {showTrailerButton && (
                    <button
                        onClick={onPlayTrailer}
                        className="ml-2 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-amber-300"
                        title={t('discovery.play_trailer')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    </button>
                )}

                {/* AUDIO PLAYER (In Reader) */}
                {view === 'reader' && audioUrl && (
                    <div className="ml-auto mr-2">
                        <MiniPlayer audioUrl={audioUrl} />
                    </div>
                )}
            </div>
        </div>
    );
};
