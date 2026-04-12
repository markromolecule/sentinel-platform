import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { type HonoEnv } from '../types/hono';

export function hasActivePermission(c: Context<HonoEnv>, permissionKey: string) {
    const activePermissionKeys = c.get('activePermissionKeys') ?? [];
    return activePermissionKeys.includes(permissionKey);
}

export function requireActivePermission(
    c: Context<HonoEnv>,
    permissionKey: string,
    message = 'Forbidden. You do not have permission to perform this action.',
) {
    if (!hasActivePermission(c, permissionKey)) {
        throw new HTTPException(403, { message });
    }
}
