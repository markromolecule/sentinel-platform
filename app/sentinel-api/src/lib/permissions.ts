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
