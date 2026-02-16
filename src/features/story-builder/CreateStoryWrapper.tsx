import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { StorySetup } from './components/StorySetup';
import { StoryBook } from '../../types';

interface CreateStoryWrapperProps {
    onComplete: (story: StoryBook) => Promise<void>;
    onOpenStore: () => void;
}

export const CreateStoryWrapper: React.FC<CreateStoryWrapperProps> = ({ onComplete, onOpenStore }) => {
    const location = useLocation();
    // Unique key to force re-mount on navigation to this route
    const [key, setKey] = useState(0);

    useEffect(() => {
        // Reset whenever the location changes (e.g. clicking "Create" again)
        setKey(prev => prev + 1);
    }, [location.pathname, location.search]);

    return (
        <div className="z-10 w-full h-[100svh] md:h-full overflow-y-auto flex flex-col items-center py-10 relative">
            <StorySetup
                key={key}
                onComplete={onComplete}
                onOpenStore={onOpenStore}
            />
        </div>
    );
};
