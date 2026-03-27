export interface CardItem {
    id: string;
    type: 'icon' | 'text' | 'image' | 'sticker';
    content: any; // For icons: Component, for images: string URL
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
    rotation: number;
    // Text Styling
    color?: string;
    fontFamily?: string;
    fontSize?: number;
}

export interface CardPage {
    id: string;
    name: string;
    items: CardItem[];
    background: string;
}

export interface CardTemplate {
    id: string;
    name: string;
    thumbnail: string;
    pages: CardPage[];
}

import { TFunction } from 'i18next';
import Konva from 'konva';

/** Props shared between Desktop and Mobile card studio variants */
export interface SharedCardStudioProps {
    state: ReturnType<typeof import('./hooks/useCardEditorState').useCardEditorState>;
    ai: ReturnType<typeof import('./hooks/useCardEditorAI').useCardEditorAI>;
    activeTool: 'background' | 'stickers' | 'text' | 'ai' | 'templates' | null;
    setActiveTool: (tool: 'background' | 'stickers' | 'text' | 'ai' | 'templates' | null) => void;
    selectedId: string | null;
    setSelectedId: (id: string | null) => void;
    viewStartIndex: number;
    setViewStartIndex: (idx: number) => void;
    direction: number;
    setDirection: (d: number) => void;
    textColor: string;
    setTextColor: (c: string) => void;
    textFont: string;
    setTextFont: (f: string) => void;
    isSaving: boolean;
    isExporting: boolean;
    stageRef: React.RefObject<Konva.Stage>;
    onSave: () => void;
    onDownload: () => void;
    onShare: () => void;
    onNewProject: () => void;
    onGenerateAI: (prompt: string, mode: 'sticker' | 'background') => void;
    onAddText: (text: string) => void;
    onAddImage: (url: string) => void;
    onSelectTemplate: (template: CardTemplate) => void;
    goToNextPage: () => void;
    goToPrevPage: () => void;
    t: TFunction;
    defaultPages: CardPage[];
}
