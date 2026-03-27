export interface BookPage {
    id: string;
    text: string;
    imageUrl?: string;
    prompt?: string;
    isCover?: boolean;
    isBackCover?: boolean;
}

import { TFunction } from 'i18next';

export interface CustomBookEditorProps {
    onBack: () => void;
    onOpenStore?: () => void;
}

/** Props shared between Desktop and Mobile editor variants */
export interface SharedEditorProps {
    state: ReturnType<typeof import('./hooks/useCustomBookEditor').useCustomBookEditor>['state'];
    actions: ReturnType<typeof import('./hooks/useCustomBookEditor').useCustomBookEditor>['actions'];
    refs: ReturnType<typeof import('./hooks/useCustomBookEditor').useCustomBookEditor>['refs'];
    onBack: () => void;
    t: TFunction;
}
