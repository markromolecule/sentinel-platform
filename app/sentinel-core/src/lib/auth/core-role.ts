const CORE_ALLOWED_ROLES = ['admin', 'superadmin'] as const;

export type CoreRole = (typeof CORE_ALLOWED_ROLES)[number];

type SupabaseRoleSource =
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

export function normalizeCoreRole(role: unknown): CoreRole | null {
    if (typeof role !== 'string') {
        return null;
    }

    const normalizedRole = role.toLowerCase();

    return CORE_ALLOWED_ROLES.includes(normalizedRole as CoreRole)
        ? (normalizedRole as CoreRole)
        : null;
}

export function isAllowedCoreRole(role: unknown): role is CoreRole {
    return normalizeCoreRole(role) !== null;
}

export function resolveCoreRole(source: SupabaseRoleSource): CoreRole | null {
    const candidates = [
        source?.user_metadata?.role,
        source?.app_metadata?.role,
        source?.role,
    ];

    for (const candidate of candidates) {
        const normalizedRole = normalizeCoreRole(candidate);

        if (normalizedRole) {
            return normalizedRole;
        }
    }

    return null;
}
