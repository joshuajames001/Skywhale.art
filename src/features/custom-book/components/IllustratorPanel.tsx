import React from 'react';
import { motion } from 'framer-motion';
import { Star, ImageIcon, Loader2, Camera, X } from 'lucide-react';

export const IllustratorPanel = ({ state, actions, refs, t }: any) => {
    return (
        <div className="flex-1 bg-[#fdfbf7] relative flex flex-col items-center justify-center p-2 md:p-8 overflow-hidden h-1/2 md:h-full">
            {/* Canvas Container */}
            <div className="w-full h-full bg-white rounded-xl md:rounded-3xl border-2 border-stone-100 relative overflow-hidden group flex flex-col shadow-inner items-center justify-center z-10">
                {/* Image Area */}
                <div className="flex-1 w-full relative overflow-hidden flex items-center justify-center bg-stone-50/30">
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 md:p-8 text-center bg-stone-50/50">
                        {/* Cover Badge */}
                        {state.currentPage.isCover && (
                            <div className="absolute top-4 md:top-8 left-1/2 -translate-x-1/2 px-3 py-1 bg-stone-900 text-white text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg z-20 flex items-center gap-2">
                                <Star size={8} className="text-yellow-400 fill-yellow-400" />
                                {t('library.custom_book_editor.badge_cover')}
                            </div>
                        )}

                        {state.currentPage.imageUrl ? (
                            <motion.img
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                src={state.currentPage.imageUrl}
                                alt="Scene"
                                className="max-w-full max-h-full object-contain shadow-lg"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center text-stone-300 p-4 md:p-8 text-center select-none">
                                <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-stone-50 flex items-center justify-center mb-4 md:mb-6">
                                    <ImageIcon size={24} className="opacity-30" />
                                </div>
                                <p className="text-sm md:text-xl font-bold opacity-40 font-title">{t('library.custom_book_editor.canvas_empty')}</p>
                            </div>
                        )}

                        {/* Magic Button Overlay */}
                        <div className={`absolute inset-0 bg-white/80 transition-all duration-500 flex flex-col items-center justify-center gap-4 md:gap-6 backdrop-blur-sm ${!state.currentPage.imageUrl || state.isGeneratingImage || state.isUploading ? 'opacity-100' : 'opacity-0 md:hover:opacity-100'}`}>
                            {/* Mobile: Tapping image toggles overlay, but here we keep it simple - empty = show */}

                            {/* AI Magic Button */}
                            {!state.isGeneratingImage && !state.isUploading && (
                                <div className="flex flex-col gap-2 md:gap-3 items-center scale-90 md:scale-100">
                                    <button
                                        id="generate-image-btn"
                                        onClick={() => actions.handleGenerateScene(false)}
                                        disabled={!state.currentPage.text.trim()}
                                        className="group relative px-6 py-3 md:px-8 md:py-4 bg-stone-900 hover:bg-purple-600 disabled:bg-stone-100 disabled:text-stone-300 text-white rounded-xl md:rounded-2xl font-black shadow-2xl transform active:scale-95 transition-all flex items-center gap-2 md:gap-4 overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                        <span className="text-xl md:text-2xl">✨</span>
                                        <span className="text-sm md:text-lg tracking-wide">{state.currentPage.isCover ? t('library.custom_book_editor.btn_conjure') : (state.currentPage.imageUrl ? t('library.custom_book_editor.btn_reconjure') : t('library.custom_book_editor.btn_conjure'))}</span>
                                        {!state.hasEnoughEnergy && (
                                            <div className="absolute inset-0 bg-stone-900/90 flex flex-col items-center justify-center text-[10px] uppercase font-bold text-red-400">
                                                <span>{t('library.custom_book_editor.insufficient_energy')}</span>
                                                <span>{state.costPerImage} ⚡</span>
                                            </div>
                                        )}
                                    </button>
                                    {!state.hasEnoughEnergy && (
                                        <button onClick={actions.onOpenStore} className="text-[10px] underline text-stone-500 hover:text-stone-700">
                                            {t('library.custom_book_editor.btn_charge_energy')}
                                        </button>
                                    )}

                                    {state.magicMirrorUrl && (
                                        <button
                                            onClick={() => actions.handleGenerateScene(true)}
                                            disabled={!state.currentPage.text.trim()}
                                            className="group relative px-6 py-3 md:px-8 md:py-4 bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-xl md:rounded-2xl font-black shadow-[0_10px_30px_rgba(79,70,229,0.3)] transform active:scale-95 transition-all flex items-center gap-2 md:gap-4 border-2 border-white/20 overflow-hidden"
                                        >
                                            <span className="text-xl md:text-2xl drop-shadow-md">✨👤</span>
                                            <span className="text-sm md:text-lg tracking-wide">{t('library.custom_book_editor.btn_conjure_me')}</span>
                                            {!state.hasEnoughEnergy && (
                                                <div className="absolute inset-0 bg-stone-900/90 flex flex-col items-center justify-center text-[10px] uppercase font-bold text-red-400">
                                                    <span>{t('library.custom_book_editor.insufficient_energy')}</span>
                                                    <span>{state.costPerImage} ⚡</span>
                                                </div>
                                            )}
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Manual Upload */}
                            {!state.isGeneratingImage && !state.isUploading && (
                                <button
                                    onClick={() => refs.fileInputRef.current?.click()}
                                    className="mt-2 md:mt-6 flex items-center gap-2 text-stone-400 hover:text-stone-600 transition-colors text-xs md:text-sm font-medium"
                                >
                                    <Camera size={14} />
                                    <span>{state.currentPage.imageUrl ? t('library.custom_book_editor.btn_change_photo') : t('library.custom_book_editor.btn_upload_photo')}</span>
                                </button>
                            )}

                            {/* Loading State */}
                            {(state.isGeneratingImage || state.isUploading) && (
                                <div className="flex flex-col items-center gap-2 md:gap-4">
                                    <Loader2 size={32} className="text-purple-500 animate-spin" />
                                    <p className="font-title font-bold text-stone-400 text-sm md:text-base">
                                        {state.isGeneratingImage ? t('library.custom_book_editor.status_working') : t('library.custom_book_editor.status_uploading')}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                    <input
                        type="file"
                        ref={refs.fileInputRef}
                        onChange={actions.handlePhotoUpload}
                        accept="image/*"
                        className="hidden"
                    />
                </div>
            </div>
        </div>
    );
};
