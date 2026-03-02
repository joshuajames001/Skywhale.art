import React, { createContext, useContext, ReactNode } from 'react';
import { StoryBook } from '../../types';

export type LibraryTab = 'public' | 'private' | 'favorites' | 'cards';

export interface LibraryAdapter {
    // Data Fetching
    fetchBooks(tab: LibraryTab, userId?: string): Promise<StoryBook[]>;

    // Actions
    togglePublicStatus(bookId: string, currentStatus: boolean, userId: string): Promise<{ success: boolean; blockedReason?: string }>;
    deleteBook(bookId: string, userId: string): Promise<boolean>;
    toggleFavorite(bookId: string, isFavorite: boolean, userId: string): Promise<void>;
    getFavoriteIds(userId: string): Promise<string[]>;

    // Navigation
    onOpenBook: (book: StoryBook) => void;
    onOpenMagic: () => void;
    onCreateCustom: () => void;
    onCreateCard?: () => void;
}

const LibraryContext = createContext<LibraryAdapter | null>(null);

export const useLibrary = () => {
    const context = useContext(LibraryContext);
    if (!context) {
        throw new Error('useLibrary must be used within a LibraryProvider');
    }
    return context;
};

interface LibraryProviderProps {
    adapter: LibraryAdapter;
    children: ReactNode;
}

export const LibraryProvider: React.FC<LibraryProviderProps> = ({ adapter, children }) => {
    return (
        <LibraryContext.Provider value={adapter}>
            {children}
        </LibraryContext.Provider>
    );
};
