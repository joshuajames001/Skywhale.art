import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../../lib/supabase';
import { PublishDialog } from './PublishDialog';
import { AchievementToast } from '../../profile/components/AchievementToast';
import { useCustomBookEditor } from '../hooks/useCustomBookEditor';
import { EditorToolbar } from './EditorToolbar';
import { WriterPanel } from './WriterPanel';
import { GeminiSuggestion } from './GeminiSuggestion';
import { IllustratorPanel } from './IllustratorPanel';
import { DictionarySidebar } from './DictionarySidebar';
import { TimelineFooter } from './TimelineFooter';
import { CustomBookEditorProps } from '../types';
import { HiddenCustomBookTemplate } from './HiddenCustomBookTemplate';

const CustomBookEditor: React.FC<CustomBookEditorProps> = ({ onBack, onOpenStore }) => {
    const { t } = useTranslation();
    const { state, actions, refs } = useCustomBookEditor({ onBack, onOpenStore });

    return (
        <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 text-stone-100 font-sans selection:bg-purple-500/30 flex flex-col overflow-hidden z-40">
            {/* Top Bar */}
            <EditorToolbar state={state} actions={actions} refs={refs} onBack={onBack} t={t} />

            {/* Main Workspace - Floating Book */}
            <main className="flex-1 flex md:overflow-hidden overflow-y-auto relative p-2 md:p-8 items-stretch md:items-center justify-center">

                {/* Book Container */}
                <div className="w-full max-w-7xl h-full bg-[#fdfbf7] md:rounded-[3rem] rounded-xl shadow-2xl shadow-purple-900/30 flex flex-col md:flex-row overflow-hidden relative border-4 md:border-[12px] border-white/40 ring-1 ring-black/5">
                    {/* TOP/LEFT PANEL: The Writer */}
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

                    {/* CENTRAL SPINE (Hidden on mobile) */}
                    <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-24 -ml-12 bg-gradient-to-r from-stone-500/10 via-stone-900/5 to-stone-500/10 pointer-events-none z-10 mix-blend-multiply blur-sm" />
                    <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-stone-300/30 z-20" />

                    {/* BOTTOM/RIGHT PANEL: The Illustrator */}
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

            {/* Hidden PDF Template */}
            <HiddenCustomBookTemplate pages={state.pages} isExporting={state.isExportingPdf} />

            {/* Publish Dialog */}
            {state.showPublishDialog && state.publishBookId && (
                <PublishDialog
                    bookId={state.publishBookId}
                    onPublish={async (isPublic) => {
                        await supabase
                            .from('books')
                            .update({ is_public: isPublic })
                            .eq('id', state.publishBookId!); // Assert because conditional checks it

                        console.log(`📚 Custom book ${state.publishBookId} ${isPublic ? 'published' : 'kept private'}`);
                        onBack(); // Go back after choosing
                    }}
                    onClose={() => {
                        actions.setShowPublishDialog(false);
                        actions.setPublishBookId(null);
                        onBack(); // Go back even if closed without choosing
                    }}
                />
            )}

            {/* Achievement Toast */}
            <AchievementToast
                achievement={state.currentAchievement}
                onDismiss={() => actions.setCurrentAchievement(null)}
            />
        </div>
    );
};

export default CustomBookEditor;
