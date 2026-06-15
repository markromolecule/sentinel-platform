import { HTTPException } from 'hono/http-exception';

/**
 * Ensures only the creator, admin, or superadmin can mutate an exam.
 */
export function assertExamOwnership(
    createdBy: string | null | undefined,
    requestingUserId: string,
    role?: string | null,
) {
    if (role === 'admin' || role === 'superadmin') {
        return;
    }

    if (!createdBy || createdBy !== requestingUserId) {
        throw new HTTPException(403, {
            message: 'You do not have permission to modify this exam.',
        });
    }
}
