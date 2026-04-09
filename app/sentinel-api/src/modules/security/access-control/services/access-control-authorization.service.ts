import { HTTPException } from 'hono/http-exception';

export function assertSupportAccess(role?: string | null) {
    if (role !== 'support') {
        throw new HTTPException(403, {
            message: 'Forbidden. Only support users can manage access control.',
        });
    }
}
