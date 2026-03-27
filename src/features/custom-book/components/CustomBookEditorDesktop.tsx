import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { EditorToolbar } from './EditorToolbar';
import { WriterPanel } from './WriterPanel';
import { GeminiSuggestion } from './GeminiSuggestion';
import { IllustratorPanel } from './IllustratorPanel';
import { DictionarySidebar } from './DictionarySidebar';
import { TimelineFooter } from './TimelineFooter';
import { SharedEditorProps } from '../types';

export const CustomBookEditorDesktop: React.FC<SharedEditorProps> = ({ state, actions, refs, onBack, t }) => (
    <>
        {/* Top Bar */}
        <EditorToolbar state={state} actions={actions} refs={refs} onBack={onBack} t={t} />

        {/* Main Workspace - Floating Book */}
        <main className="flex-1 flex md:overflow-hidden overflow-y-auto relative p-2 md:p-8 items-stretch md:items-center justify-center">
            {/* Book Container */}
            <div className="w-full max-w-7xl h-full bg-[#fdfbf7] md:rounded-[3rem] rounded-xl shadow-2xl shadow-purple-900/30 flex flex-col md:flex-row overflow-hidden relative border-4 md:border-[12px] border-white/40 ring-1 ring-black/5">
                {/* LEFT PANEL: The Writer */}
                <div className="flex-1 flex flex-col relative h-1/2 md:h-full">
                    <WriterPanel state={state} actions={actions} t={t} />

                    {/* Gemini Suggestion Bubble */}
                    <div className="absolute inset-x-0 bottom-0 pointer-events-none">
                        <div className="relative w-full h-full pointer-events-auto">
                            <GeminiSuggestion
                                suggestion={state.suggestion}
                                onAccept={actions.acceptSuggestion}
                                onDismiss={actions.dismissSuggestion}
                                t={t}
                            />
                        </div>
                    </div>
                </div>

                {/* CENTRAL SPINE */}
                <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-24 -ml-12 bg-gradient-to-r from-stone-500/10 via-stone-900/5 to-stone-500/10 pointer-events-none z-10 mix-blend-multiply blur-sm" />
                <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-stone-300/30 z-20" />

                {/* RIGHT PANEL: The Illustrator */}
                <IllustratorPanel state={state} actions={actions} refs={refs} t={t} />
            </div>

            {/* DICTIONARY SIDEBAR */}
            <AnimatePresence>
                {state.showDictionary && (
                    <DictionarySidebar state={state} actions={actions} t={t} />
                )}
            </AnimatePresence>
        </main>

        {/* Bottom Timeline */}
        <TimelineFooter state={state} actions={actions} />
    </>
);
