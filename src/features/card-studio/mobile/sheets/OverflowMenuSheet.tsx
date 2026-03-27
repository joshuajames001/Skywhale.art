import React from 'react';
import { motion } from 'framer-motion';
import { Save, Download, Share2, FilePlus, Loader2 } from 'lucide-react';

interface OverflowMenuSheetProps {
    isSaving: boolean;
    onSave: () => void;
    onDownload: () => void;
    onShare: () => void;
    onNewProject: () => void;
    onClose: () => void;
}

export const OverflowMenuSheet: React.FC<OverflowMenuSheetProps> = ({ isSaving, onSave, onDownload, onShare, onNewProject, onClose }) => (
    <>
        <motion.div
            className="fixed inset-0 bg-black/30 z-[90]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
        />
        <motion.div
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-[91] pb-6"
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-4" />
            <button
                onClick={() => { onSave(); onClose(); }}
                disabled={isSaving}
                className="flex items-center gap-3 w-full px-5 py-3.5 text-left hover:bg-gray-50 active:bg-gray-100"
            >
                <Save size={18} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-800">Uložit</span>
                {isSaving && <Loader2 size={14} className="animate-spin text-gray-400" />}
            </button>
            <button
                onClick={() => { onDownload(); onClose(); }}
                className="flex items-center gap-3 w-full px-5 py-3.5 text-left hover:bg-gray-50 active:bg-gray-100"
            >
                <Download size={18} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-800">Stáhnout PNG</span>
            </button>
            <button
                onClick={() => { onShare(); onClose(); }}
                className="flex items-center gap-3 w-full px-5 py-3.5 text-left hover:bg-gray-50 active:bg-gray-100"
            >
                <Share2 size={18} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-800">Sdílet</span>
            </button>
            <button
                onClick={() => { onNewProject(); onClose(); }}
                className="flex items-center gap-3 w-full px-5 py-3.5 text-left hover:bg-gray-50 active:bg-gray-100"
            >
                <FilePlus size={18} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-800">Nová karta</span>
            </button>
        </motion.div>
    </>
);
