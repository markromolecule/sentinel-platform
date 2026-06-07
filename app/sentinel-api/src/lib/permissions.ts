import { Context, MiddlewareHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { type HonoEnv } from '../types/hono';

/**
 * Returns true if the given permission key (or any in an array) is present
 * in the user's active permission set.
 *
 * Supports passing a Hono Context (for backward compatibility), a Set of strings, or an array of strings.
 *
 * @param keysOrContext - Hono Context, Set of permission keys, or array of permission keys.
 * @param required - The required permission key(s).
 */
export function hasActivePermission(
    keysOrContext: Set<string> | string[] | Context<HonoEnv>,
    required: string | string[],
): boolean {
    let keys: Set<string> | string[];
    if (
        typeof keysOrContext === 'object' &&
        keysOrContext !== null &&
        'get' in keysOrContext &&
        typeof (keysOrContext as any).get === 'function'
    ) {
        keys = (keysOrContext as Context<HonoEnv>).get('activePermissionKeys') ?? [];
    } else {
        keys = keysOrContext as Set<string> | string[];
    }

    const requiredKeys = Array.isArray(required) ? required : [required];
    const keySet = keys instanceof Set ? keys : new Set(keys);

    return requiredKeys.some((req) => keySet.has(req));
}

/**
 * Throws HTTP 403 if the user lacks the required permission key.
 * Use inside service functions where the Hono Context is available.
 *
 * @param c - The Hono Context.
 * @param required - The required permission key(s).
 * @param message - Custom error message for the 403 exception.
 */
export function requireActivePermission(
    c: Context<HonoEnv>,
    required: string | string[],
    message = 'Forbidden. You do not have permission to perform this action.',
): void {
    const hasAny = hasActivePermission(c, required);

    if (!hasAny) {
        throw new HTTPException(403, { message });
    }
}

/**
 * Hono middleware factory. Use on route definitions.
 *
 * @example app.get('/rooms', requirePermission('rooms:view'), handler)
 * @param required - The required permission key(s).
 */
export function requirePermission(required: string | string[]): MiddlewareHandler<HonoEnv> {
    return async (c, next) => {
        requireActivePermission(c, required);
        await next();
    };
}
