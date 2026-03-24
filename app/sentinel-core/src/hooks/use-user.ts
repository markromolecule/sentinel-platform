import { useAuth } from '@sentinel/hooks';

export function useUser() {
    const { user, isLoading } = useAuth();

    return {
        data: user ? {
            ...user,
            role: user?.user_metadata?.role as 'admin' | 'superadmin' | undefined,
        } : null,
        isLoading,
    };
}
