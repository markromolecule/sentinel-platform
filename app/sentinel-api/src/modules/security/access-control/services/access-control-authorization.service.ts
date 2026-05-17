import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { type HonoEnv } from '../../../../types/hono';
import { hasActivePermission } from '../../../../lib/permissions';

/**
 * Validates access to access control endpoints based on role and active permissions.
 *
 * @param c - The Hono context object.
 */
export function assertAccessControlAccess(c: Context<HonoEnv>) {
    const supabaseUser = c.get('supabaseUser') as any;
    const role = supabaseUser?.user_metadata?.role;

    // Support always has complete access
    if (role === 'support') {
        return;
    }

    const isGet = c.req.method.toUpperCase() === 'GET';
    const requiredPermission = isGet ? 'permissions:view' : 'permissions:manage';

    if ((role === 'superadmin' || role === 'admin') && hasActivePermission(c, requiredPermission)) {
        return;
    }

    throw new HTTPException(403, {
        message: `Forbidden. You do not have permission to ${isGet ? 'view' : 'manage'} access control.`,
    });
}

/**
 * Asserts that the active role is within the allowed administrative group.
 * Rely on assertAccessControlAccess for granular permission validation.
 *
 * @param role - The active user role.
 */
export function assertSupportAccess(role?: string | null) {
    if (role !== 'support' && role !== 'superadmin' && role !== 'admin') {
        throw new HTTPException(403, {
            message:
                'Forbidden. Only support users and authorized administrators can manage access control.',
        });
    }
}
