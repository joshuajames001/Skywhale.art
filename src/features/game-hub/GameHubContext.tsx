import { createContext, useContext, ReactNode } from 'react';

// 1. Simplified Interface for Games (Decoupled from StoryBook)
export interface GameAsset {
    id: string; // Book ID
    title: string;
    coverUrl: string | null;
}

// 2. The Adapter Interface (Ports)
export interface GameHubAdapter {
    onFetchBooks: () => Promise<GameAsset[]>;
    onFetchPages: (bookId: string) => Promise<string[]>; // Returns URL list
    onExit: () => void;
}

// 3. Context Creation
const GameHubContext = createContext<GameHubAdapter | null>(null);

// 4. Provider Component
interface GameHubProviderProps {
    adapter: GameHubAdapter;
    children: ReactNode;
}

export const GameHubProvider = ({ adapter, children }: GameHubProviderProps) => {
    return (
        <GameHubContext.Provider value={adapter}>
            {children}
        </GameHubContext.Provider>
    );
};

// 5. Hook for Consumption
export const useGameHub = () => {
    const context = useContext(GameHubContext);
    if (!context) {
        throw new Error("useGameHub must be used within a GameHubProvider");
    }
    return context;
};
