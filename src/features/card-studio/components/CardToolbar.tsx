import { Undo2, Redo2, Home, Loader2, Plus, Share2, Save, Download, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CardToolbarProps {
    canUndo: boolean;
    canRedo: boolean;
    onUndo: () => void;
    onRedo: () => void;
    onDownload: () => void;
    onSave: () => void;
    onShare: () => void;
    onNewProject: () => void;
    onClosePanel: () => void;
    isSaving: boolean;
    isExporting: boolean;
    showClosePanel: boolean;
}

export const CardToolbar = ({
    canUndo, canRedo, onUndo, onRedo, onDownload, onSave, onShare,
    onNewProject, onClosePanel, isSaving, isExporting, showClosePanel,
}: CardToolbarProps) => {
    const { t } = useTranslation();

    return (
        <div className="h-16 bg-white/10 backdrop-blur-md border-b border-white/20 flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-[60]">
            <div className="flex items-center gap-4">
                <a href="/?view=landing" className="w-10 h-10 bg-indigo-500/20 hover:bg-indigo-500/40 rounded-xl flex items-center justify-center text-indigo-300 transition-colors">
                    <Home size={20} />
                </a>
                <span className="text-white font-bold text-lg block md:hidden">{t('atelier.title')}</span>
                <span className="text-white font-bold text-lg hidden md:block">{t('atelier.title_v2')}</span>
                <button
                    onClick={onNewProject}
                    className="w-8 h-8 rounded-full bg-red-500/20 hover:bg-red-500 border border-red-500/50 flex items-center justify-center text-red-200 hover:text-white transition-all shrink-0 ml-4 hover:scale-110 hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                    title={t('atelier.new_project')}
                >
                    <Plus size={16} className="rotate-45" strokeWidth={3} />
                </button>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={onUndo} disabled={!canUndo} className="p-2 hover:bg-white/10 rounded-full text-white disabled:opacity-30"><Undo2 size={20} /></button>
                <button onClick={onRedo} disabled={!canRedo} className="p-2 hover:bg-white/10 rounded-full text-white disabled:opacity-30"><Redo2 size={20} /></button>
                <div className="w-px h-6 bg-white/20 mx-1" />
                <button onClick={onDownload} disabled={isExporting} title={t('atelier.download_tooltip')}
                    className="p-2.5 bg-white/10 backdrop-blur-md rounded-full text-white/80 border border-white/20 shadow-lg hover:bg-white/20 transition-all hover:scale-110 active:scale-95 disabled:opacity-50">
                    <Download size={18} />
                </button>
                <button onClick={onSave} disabled={isSaving} title={t('atelier.save_tooltip')}
                    className="p-2.5 bg-white/10 backdrop-blur-md rounded-full text-white/80 border border-white/20 shadow-lg hover:bg-white/20 transition-all hover:scale-110 active:scale-95 disabled:opacity-50">
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                </button>
                <button onClick={onShare} title={t('atelier.share_tooltip')}
                    className="p-2.5 bg-white/10 backdrop-blur-md rounded-full text-white/80 border border-white/20 shadow-lg hover:bg-white/20 transition-all hover:scale-110 active:scale-95 disabled:opacity-50">
                    <Share2 size={18} />
                </button>
                {showClosePanel && <button onClick={onClosePanel} className="md:hidden p-2 text-white/50"><X size={20} /></button>}
            </div>
        </div>
    );
};
