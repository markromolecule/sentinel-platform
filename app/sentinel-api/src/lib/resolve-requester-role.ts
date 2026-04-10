type SupabaseJwtLike =
    | {
          role?: unknown;
          user_metadata?: {
              role?: unknown;
          } | null;
          app_metadata?: {
              role?: unknown;
          } | null;
      }
    | null
    | undefined;

export function resolveRequesterRole(supabaseUser: SupabaseJwtLike) {
    const candidates = [
        supabaseUser?.user_metadata?.role,
        supabaseUser?.app_metadata?.role,
        supabaseUser?.role,
    ];

    for (const candidate of candidates) {
        if (typeof candidate === 'string' && candidate.trim().length > 0) {
            return candidate.trim().toLowerCase();
        }
    }

    return undefined;
}
