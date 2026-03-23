interface RouteFlags {
    isImmersive: boolean;
    isLanding: boolean;
    hideGlobalUI: boolean;
}

export const getRouteFlags = (pathname: string): RouteFlags => {
    const isImmersive = pathname.includes('/editor') ||
        pathname.includes('/story') ||
        pathname.includes('/card-studio') ||
        pathname.includes('/book/') ||
        pathname.includes('/studio') ||
        pathname.includes('/create') ||
        pathname.includes('/custom') ||
        pathname.includes('/card-viewer') ||
        pathname.includes('/magic');

    const isLanding = pathname === '/' || pathname === '/magic';

    const hideGlobalUI = pathname === '/magic' || pathname === '/terms' || pathname === '/privacy' || pathname === '/profile';

    return { isImmersive, isLanding, hideGlobalUI };
};

export const getNavigationView = (pathname: string): string => {
    if (pathname === '/terms') return 'terms';
    if (pathname === '/privacy') return 'privacy';
    if (pathname === '/pricing') return 'pricing';
    if (pathname === '/feedback') return 'feedback_board';
    if (pathname === '/library') return 'library';
    if (pathname === '/arcade') return 'arcade';
    if (pathname === '/encyclopedia') return 'discovery';
    if (pathname === '/create') return 'setup';
    if (pathname === '/custom') return 'create_custom';
    if (pathname === '/store') return 'energy_store';
    if (pathname === '/profile') return 'profile';
    if (pathname === '/' || pathname === '/magic') return 'landing';
    if (pathname.includes('/book')) return 'library';
    if (pathname.includes('/studio')) return 'card_studio';
    return 'library';
};
