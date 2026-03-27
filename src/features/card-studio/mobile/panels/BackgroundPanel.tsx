import React from 'react';
import { BACKGROUND_TEXTURES } from '../../data/stickers';

export const BackgroundPanel: React.FC<{ onSelect: (bg: string) => void }> = ({ onSelect }) => {
    const colors = BACKGROUND_TEXTURES.filter(b => b.type === 'color');
    const images = BACKGROUND_TEXTURES.filter(b => b.type === 'image');

    return (
        <div className="space-y-6">
            {/* Colors */}
            <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Barvy</h4>
                <div className="flex flex-wrap gap-2">
                    {colors.map(bg => (
                        <button
                            key={bg.id}
                            onClick={() => onSelect(bg.value)}
                            className="w-10 h-10 rounded-xl border-2 border-gray-200 hover:border-[#534AB7] transition-all shadow-sm"
                            style={{ backgroundColor: bg.value }}
                            title={bg.name}
                        />
                    ))}
                </div>
            </div>
            {/* Patterns */}
            <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Vzory</h4>
                <div className="grid grid-cols-2 gap-3">
                    {images.map(bg => (
                        <button
                            key={bg.id}
                            onClick={() => onSelect(bg.value)}
                            className="aspect-[4/3] rounded-xl overflow-hidden border-2 border-gray-100 hover:border-[#534AB7] transition-all shadow-sm"
                        >
                            <img src={bg.value} alt={bg.name} className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
