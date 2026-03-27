import React from 'react';
import { Save, Download, Share2, FilePlus, Loader2 } from 'lucide-react';
import { BottomSheet } from '../../../../components/BottomSheet';

interface OverflowMenuSheetProps {
    isSaving: boolean;
    onSave: () => void;
    onDownload: () => void;
    onShare: () => void;
    onNewProject: () => void;
    onClose: () => void;
}

export const OverflowMenuSheet: React.FC<OverflowMenuSheetProps> = ({ isSaving, onSave, onDownload, onShare, onNewProject, onClose }) => (
    <BottomSheet onClose={onClose}>
        <button onClick={() => { onSave(); onClose(); }} disabled={isSaving}
            className="flex items-center gap-3 w-full px-5 py-3.5 text-left hover:bg-gray-50 active:bg-gray-100">
            <Save size={18} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-800">Uložit</span>
            {isSaving && <Loader2 size={14} className="animate-spin text-gray-400" />}
        </button>
        <button onClick={() => { onDownload(); onClose(); }}
            className="flex items-center gap-3 w-full px-5 py-3.5 text-left hover:bg-gray-50 active:bg-gray-100">
            <Download size={18} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-800">Stáhnout PNG</span>
        </button>
        <button onClick={() => { onShare(); onClose(); }}
            className="flex items-center gap-3 w-full px-5 py-3.5 text-left hover:bg-gray-50 active:bg-gray-100">
            <Share2 size={18} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-800">Sdílet</span>
        </button>
        <button onClick={() => { onNewProject(); onClose(); }}
            className="flex items-center gap-3 w-full px-5 py-3.5 text-left hover:bg-gray-50 active:bg-gray-100">
            <FilePlus size={18} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-800">Nová karta</span>
        </button>
    </BottomSheet>
);
