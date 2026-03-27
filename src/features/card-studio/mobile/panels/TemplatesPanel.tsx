import React from 'react';
import { TEMPLATES } from '../../data/templates';
import { CardTemplate } from '../../types';

export const TemplatesPanel: React.FC<{ onSelect: (t: CardTemplate) => void }> = ({ onSelect }) => (
    <div className="grid grid-cols-2 gap-3">
        {TEMPLATES.map(tmpl => (
            <button
                key={tmpl.id}
                onClick={() => onSelect(tmpl)}
                className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all"
            >
                <div className="aspect-[3/4] overflow-hidden">
                    <img src={tmpl.thumbnail} alt={tmpl.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-2">
                    <span className="text-xs font-medium text-gray-700">{tmpl.name}</span>
                </div>
            </button>
        ))}
    </div>
);
