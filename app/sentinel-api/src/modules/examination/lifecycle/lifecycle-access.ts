import { HTTPException } from 'hono/http-exception';
import { requireActivePermission } from '../../../lib/permissions';
import { type HonoEnv } from '../../../types/hono';
import type { Context } from 'hono';

const LIFECYCLE_MUTATION_ROLES = new Set(['admin', 'superadmin', 'instructor']);

export function requireLifecycleMutationAccess(c: Context<HonoEnv>) {
    requireActivePermission(c, 'examinations:update');

    const role = String(c.get('role') || (c.get('supabaseUser') as any)?.user_metadata?.role || '')
        .trim()
        .toLowerCase();

    if (!LIFECYCLE_MUTATION_ROLES.has(role)) {
        throw new HTTPException(403, {
            message:
                'Forbidden. Only instructors or administrators can update attempt lifecycle state.',
        });
    }
}
