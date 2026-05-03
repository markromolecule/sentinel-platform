import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { type HonoEnv } from '../../../types/hono';

const TEMPLATE_MUTATION_ROLES = new Set(['support', 'superadmin']);

export function assertCanMutateParentTemplate(c: Context<HonoEnv>) {
    const role = (c.get('supabaseUser') as any)?.user_metadata?.role;

    if (!TEMPLATE_MUTATION_ROLES.has(role)) {
        throw new HTTPException(403, {
            message: 'Only support or superadmin users can mutate parent template records.',
        });
    }
}

export function assertCanMutateBranchScope(c: Context<HonoEnv>, branchInstitutionId: string) {
    const role = (c.get('supabaseUser') as any)?.user_metadata?.role;
    const requesterInstitutionId = c.get('institutionId');

    if (TEMPLATE_MUTATION_ROLES.has(role)) {
        return;
    }

    if (role === 'admin' && requesterInstitutionId === branchInstitutionId) {
        return;
    }

    throw new HTTPException(403, {
        message: 'You cannot mutate records outside your institution scope.',
    });
}

export function assertCannotMutateParentOwnedRow(args: {
    requesterInstitutionId?: string | null;
    rowInstitutionId?: string | null;
    rowSourceRecordId?: string | null;
}) {
    if (
        args.requesterInstitutionId &&
        args.rowInstitutionId &&
        args.requesterInstitutionId !== args.rowInstitutionId &&
        !args.rowSourceRecordId
    ) {
        throw new HTTPException(403, {
            message: 'Branch users cannot directly mutate parent-owned records.',
        });
    }
}
