import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';

interface ProtectedRouteProps {
    user: User | null;
    loading: boolean;
    children: ReactNode;
}

export const ProtectedRoute = ({ user, loading, children }: ProtectedRouteProps) => {
    const location = useLocation();

    if (loading) return null;
    if (!user) return <Navigate to="/" replace state={{ from: location.pathname }} />;

    return <>{children}</>;
};
