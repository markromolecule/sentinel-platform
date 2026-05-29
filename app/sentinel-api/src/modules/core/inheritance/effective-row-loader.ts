import { type DbClient } from '@sentinel/db';
import {
    decorateWithOriginMetadata,
    mergeEffectiveRows,
    resolveParentScope,
    type InheritableRow,
} from './inheritance-resolver.helper';
import { LogsService } from '../../general/logs/logs.service';

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

    const merged = mergeEffectiveRows(parentRows, childRows, {
        idKey,
        effectiveInstitutionId: institutionId,
    });

    // Telemetry logging
    try {
        await LogsService.createLog(dbClient, {
            userId: '00000000-0000-0000-0000-000000000000',
            action: 'inheritance.resolved',
            resourceType: 'inheritance',
            resourceId: idKey,
            activeInstitutionId: institutionId,
            details: {
                idKey,
                parentInstitutionId: scope.parentInstitutionId,
                parentCount: parentRows.length,
                childCount: childRows.length,
                mergedCount: merged.length,
            },
        });
    } catch (logErr) {
        // Fail-safe suppression for inline read telemetry
    }

    return merged;
}
