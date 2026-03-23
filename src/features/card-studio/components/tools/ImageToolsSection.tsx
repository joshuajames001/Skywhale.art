import { useTranslation } from 'react-i18next';
import { BACKGROUND_TEXTURES } from '../../data/stickers';

interface ImageToolsSectionProps {
    onChangeBackground: (bg: string) => void;
}

export const ImageToolsSection = ({ onChangeBackground }: ImageToolsSectionProps) => {
    const { t } = useTranslation();

    const grouped = BACKGROUND_TEXTURES.reduce((acc: Record<string, any[]>, bg: any) => {
        const cat = bg.category || t('tools.category_other');
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(bg);
        return acc;
    }, {});

    return (
        <div className="flex flex-col gap-6 pb-8">
            {Object.entries(grouped).map(([category, items]) => (
                <div key={category}>
                    <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">{category}</h4>
                    <div className="grid grid-cols-2 gap-2">
                        {items.map((bg: any) => (
                            <button key={bg.id} onClick={() => onChangeBackground(bg.value)}
                                className="h-20 w-full rounded-lg border border-white/10 relative overflow-hidden bg-cover bg-center hover:scale-105 transition-all"
                                style={{ backgroundColor: bg.type === 'color' ? bg.value : undefined, backgroundImage: bg.type === 'image' ? `url(${bg.value})` : undefined }}>
                                <span className="absolute bottom-1 left-2 text-[10px] text-white shadow-black drop-shadow-md">{bg.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            ))}
            <button onClick={() => onChangeBackground('#000000')} className="py-3 rounded-lg border border-white/10 bg-black text-xs text-white">
                {t('tools.reset_black')}
            </button>
        </div>
    );
};
