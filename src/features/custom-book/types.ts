export interface BookPage {
    id: string;
    text: string;
    imageUrl?: string;
    prompt?: string;
    isCover?: boolean;
    isBackCover?: boolean;
}

export interface CustomBookEditorProps {
    onBack: () => void;
    onOpenStore?: () => void;
}
