import { useAuth } from '@sentinel/hooks';
import { useMemo } from 'react';
import { resolveCoreRole } from '@/lib/auth/core-role';

export function useUser() {
    const { user, isLoading } = useAuth();

    const data = useMemo(() => {
        if (!user) return null;
        return {
            ...user,
            role: resolveCoreRole(user) || undefined,
        };
    }, [user]);

    return {
        data,
        isLoading,
    };
}
