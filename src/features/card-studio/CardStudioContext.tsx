import React, { createContext, useContext, ReactNode } from 'react';
import { CardPage } from './types';

// --- ADAPTER INTERFACE ---
// This defines the "Port" that the application must plug into.
export interface CardStudioAdapter {
    // Session / User
    user: { id: string } | null;

    // Actions
    onSaveProject: (projectData: {
        id: string;
        title: string;
        pages: CardPage[];
        thumbnailBlob: Blob;
    }) => Promise<boolean>;

    onGenerateImage: (
        prompt: string,
        mode: 'sticker' | 'background',
        referenceUrl?: string | null
    ) => Promise<{ imageUrl: string }>;

    onModerateContent: (text: string) => Promise<void>;

    // Extras (formerly useGemini)
    onDictionaryLookup: (term: string) => Promise<any>;
    onTranslate: (text: string) => Promise<string | null>;
}

// --- CONTEXT ---
const CardStudioContext = createContext<CardStudioAdapter | null>(null);

// --- HOOK ---
export const useCardStudio = () => {
    const context = useContext(CardStudioContext);
    if (!context) {
        throw new Error("useCardStudio must be used within a CardStudioProvider");
    }
    return context;
};

// --- PROVIDER ---
interface CardStudioProviderProps {
    adapter: CardStudioAdapter;
    children: ReactNode;
}

export const CardStudioProvider = ({ adapter, children }: CardStudioProviderProps) => {
    return (
        <CardStudioContext.Provider value={adapter}>
            {children}
        </CardStudioContext.Provider>
    );
};
