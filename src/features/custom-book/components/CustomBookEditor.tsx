import React from 'react';
import { useTranslation } from 'react-i18next';
import { PublishDialog } from './PublishDialog';
import { AchievementToast } from '../../profile/components/AchievementToast';
import { useCustomBookEditor } from '../hooks/useCustomBookEditor';
import { CustomBookEditorProps } from '../types';
import { HiddenCustomBookTemplate } from './HiddenCustomBookTemplate';
import { CustomBookEditorDesktop } from './CustomBookEditorDesktop';
import { CustomBookEditorMobile } from './CustomBookEditorMobile';
import { useMediaQuery } from '../../../hooks/useMediaQuery';

const CustomBookEditor: React.FC<CustomBookEditorProps> = ({ onBack, onOpenStore }) => {
    const { t } = useTranslation();
    const { state, actions, refs } = useCustomBookEditor({ onBack, onOpenStore });
    const isMobile = !useMediaQuery('(min-width: 768px)');

    const sharedProps = { state, actions, refs, onBack, t };

    return (
        <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 text-stone-100 font-sans selection:bg-purple-500/30 flex flex-col overflow-hidden z-40">
            {isMobile ? (
                <CustomBookEditorMobile {...sharedProps} />
            ) : (
                <CustomBookEditorDesktop {...sharedProps} />
            )}

            {/* Hidden PDF Template */}
            <HiddenCustomBookTemplate pages={state.pages} isExporting={state.isExportingPdf} />

            {/* Publish Dialog */}
            {state.showPublishDialog && state.publishBookId && (
                <PublishDialog
                    bookId={state.publishBookId}
                    onPublish={async (isPublic) => {
                        await actions.publishBook(state.publishBookId!, isPublic);
                        console.log(`📚 Custom book ${state.publishBookId} ${isPublic ? 'published' : 'kept private'}`);
                        onBack();
                    }}
                    onClose={() => {
                        actions.setShowPublishDialog(false);
                        actions.setPublishBookId(null);
                        onBack();
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
