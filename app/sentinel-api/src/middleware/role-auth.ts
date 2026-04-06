import { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { type AppBindings } from './auth';

/**
 * Middleware to restrict access to specific roles.
 * Supports checking roles from Supabase user_metadata.
 */
export const roleAuthMiddleware = (allowedRoles: string[]) => {
    return async (c: Context<AppBindings>, next: Next) => {
        const supabaseUser = c.get('supabaseUser') as any;
        const user = c.get('user');
        
        const role = supabaseUser?.user_metadata?.role;

        // Allow ONLY if the user has one of the allowed roles
        if (allowedRoles.includes(role)) {
            return await next();
        }

        console.warn(
            `Access denied for user ${user?.id} with role ${role}. Required: ${allowedRoles.join(', ')}`,
        );

        throw new HTTPException(403, {
            message: 'Forbidden. You do not have permission to perform this action.',
        });
    };
};
