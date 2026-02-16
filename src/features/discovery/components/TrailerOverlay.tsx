import { useTranslation } from 'react-i18next';

interface TrailerOverlayProps {
    url: string | null;
    onComplete: () => void;
}

export const TrailerOverlay = ({ url, onComplete }: TrailerOverlayProps) => {
    const { t } = useTranslation();

    if (!url) return null;

    return (
        <div className="fixed inset-0 z-[70] bg-black flex items-center justify-center">
            <video
                src={url}
                autoPlay
                controls
                playsInline
                className="w-full h-full object-contain"
                onEnded={onComplete}
                onError={(e) => {
                    console.error("Video Error Details:", e);
                    console.log("Attempted URL:", url);
                }}
            >
                {t('discovery.browser_no_video')}
            </video>

            <button
                onClick={onComplete}
                className="absolute top-8 right-8 px-6 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white font-medium transition-colors border border-white/20 z-[80]"
            >
                {t('discovery.skip_trailer')}
            </button>
        </div>
    );
};
