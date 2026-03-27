import React from 'react';
import { Plus } from 'lucide-react';
import { SKYWHALE_STICKERS } from '../../data/stickers';

export const StickersPanel: React.FC<{ onAdd: (content: string) => void; onOpenAI: () => void }> = ({ onAdd, onOpenAI }) => (
    <div className="grid grid-cols-4 gap-3">
        {SKYWHALE_STICKERS.map(s => (
            <button
                key={s.id}
                onClick={() => onAdd(s.content)}
                className="aspect-square flex items-center justify-center text-3xl bg-gray-50 rounded-xl border border-gray-100 hover:bg-[#EEEDFE] hover:border-[#AFA9EC] transition-all"
            >
                {s.content}
            </button>
        ))}
        {/* AI sticker generator shortcut */}
        <button
            onClick={onOpenAI}
            className="aspect-square flex items-center justify-center rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-[#534AB7] hover:text-[#534AB7] transition-all"
        >
            <Plus size={24} />
        </button>
    </div>
);
