import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { type HonoEnv } from '../types/hono';

export function hasActivePermission(c: Context<HonoEnv>, permissionKey: string) {
    const activePermissionKeys = c.get('activePermissionKeys') ?? [];
    return activePermissionKeys.includes(permissionKey);
}

export function requireActivePermission(
    c: Context<HonoEnv>,
    permissionKey: string | string[],
    message = 'Forbidden. You do not have permission to perform this action.',
) {
    const keys = Array.isArray(permissionKey) ? permissionKey : [permissionKey];
    const hasAny = keys.some((key) => hasActivePermission(c, key));

    if (!hasAny) {
        throw new HTTPException(403, { message });
    }
}

/**
 * Resolves the allowed roles for core setup resource access.
 * Admits support, superadmin, and admin for all methods (including mutations),
 * and optionally admits other roles (like instructor) for GET requests.
 *
 * @param method - The HTTP request method.
 * @param extraGetRoles - Additional roles allowed for GET requests only.
 * @returns An array of allowed role names.
 */
export function getCoreAdminAllowedRoles(method: string, extraGetRoles: string[] = []): string[] {
    const isGet = method.toUpperCase() === 'GET';
    const coreRoles = ['support', 'superadmin', 'admin'];
    return isGet ? [...coreRoles, ...extraGetRoles] : coreRoles;
}

