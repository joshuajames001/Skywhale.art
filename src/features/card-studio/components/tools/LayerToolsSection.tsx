import { ArrowUp, ArrowDown, Trash2, AlignCenter } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LayerToolsSectionProps {
    onBringForward: () => void;
    onSendBack: () => void;
    onDelete: () => void;
    onAlign: () => void;
    hasSelection: boolean;
}

export const LayerToolsSection = ({ onBringForward, onSendBack, onDelete, onAlign, hasSelection }: LayerToolsSectionProps) => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col gap-3 pb-8">
            <p className="text-slate-400 text-xs">{hasSelection ? t('tools.layer_selected', 'Selected item controls') : t('tools.layer_none', 'Select an item on canvas first')}</p>
            <div className="grid grid-cols-2 gap-2">
                <button onClick={onBringForward} disabled={!hasSelection}
                    className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white disabled:opacity-30 hover:bg-white/10 transition-colors">
                    <ArrowUp size={16} /> {t('tools.bring_forward', 'Forward')}
                </button>
                <button onClick={onSendBack} disabled={!hasSelection}
                    className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white disabled:opacity-30 hover:bg-white/10 transition-colors">
                    <ArrowDown size={16} /> {t('tools.send_back', 'Back')}
                </button>
                <button onClick={onAlign} disabled={!hasSelection}
                    className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white disabled:opacity-30 hover:bg-white/10 transition-colors">
                    <AlignCenter size={16} /> {t('tools.align_center', 'Center')}
                </button>
                <button onClick={onDelete} disabled={!hasSelection}
                    className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 disabled:opacity-30 hover:bg-red-500/20 transition-colors">
                    <Trash2 size={16} /> {t('tools.delete', 'Delete')}
                </button>
            </div>
        </div>
    );
};
