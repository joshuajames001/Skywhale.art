import React from 'react';
import { useLocation } from 'react-router-dom';
import { GreetingCardEditor } from './GreetingCardEditor';
import { CardPage } from './types';

interface CardStudioState {
    initialProject?: {
        id: string;
        title: string;
        pages: CardPage[];
    } | null;
}

export const CardStudioWrapper: React.FC = () => {
    const location = useLocation();
    const state = location.state as CardStudioState;
    const initialProject = state?.initialProject || null;

    return <GreetingCardEditor initialProject={initialProject} />;
};
