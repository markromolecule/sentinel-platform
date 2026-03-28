import { useAuth } from '@sentinel/hooks';
import { useMemo } from 'react';

export function useUser() {
    const { user, isLoading } = useAuth();

    const data = useMemo(() => {
        if (!user) return null;
        return {
            ...user,
            role: user?.user_metadata?.role as 'admin' | 'superadmin' | undefined,
        };
    }, [user]);

    return {
        data,
        isLoading,
    };
}
