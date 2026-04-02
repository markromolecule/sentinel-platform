import { useAuth } from '../../auth-provider';

export function useAuthenticatedQueryEnabled() {
    const { token, isLoading } = useAuth();

    return !isLoading && !!token;
}
