import { createContext, useContext, useState, ReactNode } from 'react';
import { ScrollDirection } from '../hooks/useScrollDirection';

interface ScrollDirectionContextType {
    direction: ScrollDirection;
    setDirection: (d: ScrollDirection) => void;
}

const ScrollDirectionContext = createContext<ScrollDirectionContextType>({
    direction: 'top',
    setDirection: () => {},
});

export const useScrollDirectionContext = () => useContext(ScrollDirectionContext);

export const ScrollDirectionProvider = ({ children }: { children: ReactNode }) => {
    const [direction, setDirection] = useState<ScrollDirection>('top');
    return (
        <ScrollDirectionContext.Provider value={{ direction, setDirection }}>
            {children}
        </ScrollDirectionContext.Provider>
    );
};
