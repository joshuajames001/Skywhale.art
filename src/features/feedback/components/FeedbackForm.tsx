import React from 'react';
import { motion } from 'framer-motion';
import { X, Send, MessageSquare } from 'lucide-react';
import { useFeedbackForm } from '../hooks/useFeedbackForm';

interface FeedbackFormProps {
    onClose: () => void;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({ onClose }) => {
    const { message, setMessage, isLoading, isSuccess, error, handleSubmit } = useFeedbackForm();

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative bg-zinc-900/90 border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-purple-900/40 to-blue-900/40">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <MessageSquare className="text-purple-300" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Máš nápad nebo zpětnou vazbu?</h2>
                            <p className="text-xs text-white/50">Napiš nám, přečteme si to.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="text-white/60" size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {isSuccess ? (
                        <div className="text-center py-8 space-y-4">
                            <div className="text-4xl">🐳</div>
                            <p className="text-white text-lg font-bold">Díky! Přečteme si to.</p>
                            <button
                                onClick={onClose}
                                className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 text-white/70 rounded-lg text-sm transition-colors"
                            >
                                Zavřít
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    maxLength={1000}
                                    placeholder="Co máš na srdci?"
                                    className="w-full h-36 bg-black/30 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 resize-none text-sm"
                                />
                                <div className="flex items-center justify-between px-1">
                                    {error && <p className="text-red-400 text-xs">{error}</p>}
                                    <span className="text-white/30 text-xs ml-auto">{message.length}/1000</span>
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={isLoading || message.trim().length < 3}
                                className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-bold shadow-lg shadow-purple-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Send size={18} /> Odeslat
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};
