import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useMagicTransition = () => {
    const navigate = useNavigate();
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [showFairy, setShowFairy] = useState(false);
    const [showFlash, setShowFlash] = useState(false);

    // MAGIC TRANSITION ORCHESTRATOR
    const triggerMagicTransition = (_targetView: string) => {
        setIsTransitioning(true);
        setShowFairy(true);
    };

    const handleFairyTrigger = () => {
        // Wand Waved! Start Flash
        setShowFlash(true);

        // Wait for flash to cover screen (approx 200-300ms depending on animation)
        setTimeout(() => {
            // CHANGE VIEW BEHIND THE CURTAIN
            navigate('/create?magic=' + Date.now()); // Force navigation/reset

            // Start cleanup
            setShowFairy(false);

            // Fade out flash
            setTimeout(() => {
                setShowFlash(false);
                setIsTransitioning(false);
            }, 500);
        }, 600);
    };

    return {
        isTransitioning,
        showFairy,
        showFlash,
        triggerMagicTransition,
        handleFairyTrigger
    };
};
