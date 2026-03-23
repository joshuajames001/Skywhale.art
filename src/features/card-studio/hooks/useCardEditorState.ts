import { useState, useEffect } from 'react';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { CardItem, CardPage } from '../types';

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useCardEditorState = (initialPages: CardPage[]) => {
    const [pages, setPages] = useLocalStorage<CardPage[]>('skywhale_draft_card_pages', initialPages);
    const [history, setHistory] = useState<CardPage[][]>([pages]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [focusedPageIndex, setFocusedPageIndex] = useState(0);

    const items = pages[focusedPageIndex]?.items || [];
    const canUndo = historyIndex > 0;
    const canRedo = historyIndex < history.length - 1;

    const addToHistory = (newPages: CardPage[]) => {
        const next = history.slice(0, historyIndex + 1);
        next.push(newPages);
        setHistory(next);
        setHistoryIndex(next.length - 1);
        setPages(newPages);
    };

    const undo = () => {
        if (!canUndo) return;
        const idx = historyIndex - 1;
        setHistoryIndex(idx);
        setPages(history[idx]);
    };

    const redo = () => {
        if (!canRedo) return;
        const idx = historyIndex + 1;
        setHistoryIndex(idx);
        setPages(history[idx]);
    };

    const addItem = (props: Partial<CardItem>) => {
        const newItem: CardItem = {
            id: generateId(), type: 'icon', content: null,
            x: 100, y: 100, scaleX: 1, scaleY: 1,
            rotation: (Math.random() - 0.5) * 10,
            ...props,
        };
        const newPages = [...pages];
        if (newPages[focusedPageIndex]) {
            const pg = newPages[focusedPageIndex];
            newPages[focusedPageIndex] = { ...pg, items: [...pg.items, newItem] };
            addToHistory(newPages);
        }
        return newItem.id;
    };

    const updateItem = (id: string, changes: Partial<CardItem>) => {
        const newPages = [...pages];
        let pageIdx = focusedPageIndex;
        if (!newPages[pageIdx]?.items.some(i => i.id === id)) {
            pageIdx = newPages.findIndex(p => p.items.some(i => i.id === id));
        }
        if (pageIdx !== -1) {
            const pg = newPages[pageIdx];
            newPages[pageIdx] = { ...pg, items: pg.items.map(i => i.id === id ? { ...i, ...changes } : i) };
            addToHistory(newPages);
        }
    };

    const removeItem = (id: string) => {
        const newPages = [...pages];
        const pageIdx = newPages.findIndex(p => p.items.some(i => i.id === id));
        if (pageIdx !== -1) {
            const pg = newPages[pageIdx];
            newPages[pageIdx] = { ...pg, items: pg.items.filter(i => i.id !== id) };
            addToHistory(newPages);
        }
    };

    const setBackground = (bg: string) => {
        const newPages = [...pages];
        if (newPages[focusedPageIndex]) {
            newPages[focusedPageIndex] = { ...newPages[focusedPageIndex], background: bg };
            addToHistory(newPages);
        }
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo(); }
            if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); redo(); }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [history, historyIndex]);

    return {
        pages, setPages, items,
        focusedPageIndex, setFocusedPageIndex,
        addItem, updateItem, removeItem,
        addToHistory, setBackground,
        undo, redo, canUndo, canRedo,
    };
};
