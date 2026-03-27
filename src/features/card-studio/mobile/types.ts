export type Panel = 'templates' | 'background' | 'stickers' | 'text' | 'ai' | 'dictionary' | null;

export interface TextEditorState {
    text: string;
    color: string;
    fontSize: number;
    fontFamily: string;
}
