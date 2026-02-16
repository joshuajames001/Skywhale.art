import React from 'react';
import { StoryChat } from '../../../../components/story/StoryChat'; // Calculated path

interface AiChatModeProps {
    onTransitionToCustom: (data: any) => void;
    onCancel: () => void;
    mode?: 'muse' | 'architect';
}

export const AiChatMode: React.FC<AiChatModeProps> = ({ onTransitionToCustom, onCancel, mode = 'muse' }) => {
    return (
        <div className={`w-full max-w-4xl bg-slate-900/90 backdrop-blur-2xl rounded-[40px] shadow-2xl h-[80vh] min-h-[600px] border relative overflow-hidden flex flex-col ${mode === 'architect' ? 'border-emerald-500/20' : 'border-cyan-500/20'}`}>
            <StoryChat
                mode={mode}
                onCancel={onCancel}
                onComplete={(data) => {
                    console.log("Chat Complete, switching to Custom Mode:", data);
                    onTransitionToCustom(data);
                }}
            />
        </div>
    );
};
