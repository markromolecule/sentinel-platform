import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { type HonoEnv } from '../../../../types/hono';
import { requireActivePermission } from '../../../../lib/permissions';

/**
 * Validates access to access control endpoints based on role and active permissions.
 *
 * @param c - The Hono context object.
 */
export function assertAccessControlAccess(c: Context<HonoEnv>): void {
    const isGet = c.req.method.toUpperCase() === 'GET';
    const requiredPermission = isGet ? 'permissions:view' : 'permissions:manage';

    requireActivePermission(c, requiredPermission);
}

/**
 * Asserts that the active role is within the allowed administrative group.
 * Rely on assertAccessControlAccess for granular permission validation.
 *
 * Supports passing Hono Context (new signature) or a role string (backward compatibility).
 *
 * @param roleOrContext - The Hono Context or active user role.
 */
export function assertSupportAccess(roleOrContext?: any): void {
    if (
        roleOrContext &&
        typeof roleOrContext === 'object' &&
        'get' in roleOrContext &&
        typeof roleOrContext.get === 'function'
    ) {
        requireActivePermission(roleOrContext as Context<HonoEnv>, 'permissions:manage');
        return;
    }

    if (
        roleOrContext !== 'support' &&
        roleOrContext !== 'superadmin' &&
        roleOrContext !== 'admin'
    ) {
        throw new HTTPException(403, {
            message:
                'Forbidden. Only support users and authorized administrators can manage access control.',
        });
    }
}
