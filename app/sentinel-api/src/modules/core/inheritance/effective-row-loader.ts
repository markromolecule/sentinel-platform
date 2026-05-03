import { type DbClient } from '@sentinel/db';
import {
    decorateWithOriginMetadata,
    mergeEffectiveRows,
    resolveParentScope,
    type InheritableRow,
} from './inheritance-resolver.helper';

export async function loadEffectiveRows<T extends InheritableRow>(args: {
    dbClient: DbClient;
    institutionId?: string;
    idKey: keyof T & string;
    loadRows: (institutionId?: string) => Promise<T[]>;
}) {
    const { dbClient, institutionId, idKey, loadRows } = args;

    if (!institutionId) {
        const rows = await loadRows(undefined);
        return decorateWithOriginMetadata(rows, {
            idKey,
            effectiveInstitutionId: null,
        });
    }

    const scope = await resolveParentScope(dbClient, institutionId);

    if (!scope.parentInstitutionId) {
        const rows = await loadRows(institutionId);
        return decorateWithOriginMetadata(rows, {
            idKey,
            effectiveInstitutionId: institutionId,
        });
    }

    const [parentRows, childRows] = await Promise.all([
        loadRows(scope.parentInstitutionId),
        loadRows(institutionId),
    ]);

    return mergeEffectiveRows(parentRows, childRows, {
        idKey,
        effectiveInstitutionId: institutionId,
    });
}
