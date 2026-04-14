import { useAuth } from '../../auth-provider';
import { useUserQuery } from './use-user-query';

/**
 * Hook to fetch the currently authenticated user's full profile details.
 * Combines Supabase auth session with our database user data.
 */
export function useProfileQuery() {
    const { user } = useAuth();
    const userId = user?.id;

    const query = useUserQuery(userId || '');

    return {
        ...query,
        profile: query.data,
        isLoading: query.isLoading || !userId,
    };
}
