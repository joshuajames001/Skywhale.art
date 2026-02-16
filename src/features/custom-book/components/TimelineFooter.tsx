import React from 'react';
import { Plus } from 'lucide-react';
import { BookPage } from '../types';

export const TimelineFooter = ({ state, actions }: any) => {
    return (
        <footer className="h-20 md:h-24 bg-white/10 backdrop-blur-md border-t border-white/20 flex items-center px-4 md:px-6 gap-3 md:gap-4 overflow-x-auto shrink-0 z-50 relative custom-scrollbar">
            {state.pages.map((page: BookPage, index: number) => (
                <button
                    key={page.id}
                    onClick={() => actions.setCurrentPageIndex(index)}
                    className={`relative group shrink-0 w-16 h-20 rounded border transition-all overflow-hidden ${index === state.currentPageIndex
                        ? 'border-purple-500 ring-2 ring-purple-500/20 bg-stone-800'
                        : 'border-white/10 hover:border-white/30 bg-stone-800/50'
                        }`}
                >
                    <span className="absolute top-1 left-2 text-[10px] font-bold text-stone-500 group-hover:text-stone-300 z-10">
                        {page.isCover ? 'T' : index}
                    </span>
                    {page.isCover && (
                        <div className="absolute top-0 right-0 bg-yellow-400 text-stone-900 text-[8px] font-black uppercase px-2 py-0.5 rounded-bl-lg z-10">
                            Obálka
                        </div>
                    )}
                    {page.imageUrl ? (
                        <img src={page.imageUrl} alt={`Page ${index + 1}`} className="absolute inset-0 w-full h-full object-cover opacity-70" />
                    ) : (
                        <div className="absolute inset-0 bg-white/5" />
                    )}
                </button>
            ))}

            <button
                onClick={actions.addNewPage}
                className="shrink-0 w-16 h-20 rounded border border-white/5 border-dashed hover:border-purple-500/50 hover:bg-purple-500/10 flex items-center justify-center text-stone-500 hover:text-purple-400 transition-all"
            >
                <Plus size={24} />
            </button>
        </footer>
    );
};
