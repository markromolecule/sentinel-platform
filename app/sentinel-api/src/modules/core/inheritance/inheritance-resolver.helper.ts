import { type DbClient } from '@sentinel/db';

export type InheritanceStatus = 'LOCAL' | 'INHERITED' | 'OVERRIDDEN' | 'HIDDEN';

export type InheritableRow = {
    institution_id?: string | null;
    source_record_id?: string | null;
    inheritance_status?: 'LOCAL' | 'OVERRIDDEN' | 'HIDDEN' | null;
    [key: string]: unknown;
};

export type InheritanceMetadata = {
    originInstitutionId: string | null;
    effectiveInstitutionId: string | null;
    sourceRecordId: string | null;
    inheritanceStatus: InheritanceStatus;
    isLocal: boolean;
    isInherited: boolean;
    isOverridden: boolean;
    isHidden: boolean;
};

export type EffectiveRow<T extends InheritableRow> = T & InheritanceMetadata;

export type ResolveParentScopeResult = {
    institutionId: string;
    parentInstitutionId: string | null;
    institutionKind: 'STANDALONE' | 'PARENT' | 'CHILD';
};

function getRecordId(row: InheritableRow, idKey: string) {
    return String(row[idKey] ?? '');
}

function getResolutionKey(row: InheritableRow, idKey: string) {
    return row.source_record_id ?? getRecordId(row, idKey);
}

function toMetadata<T extends InheritableRow>(
    row: T,
    args: {
        effectiveInstitutionId: string | null;
        status: InheritanceStatus;
        sourceRecordId?: string | null;
    },
): EffectiveRow<T> {
    return {
        ...row,
        originInstitutionId: row.institution_id ?? null,
        effectiveInstitutionId: args.effectiveInstitutionId,
        sourceRecordId: args.sourceRecordId ?? row.source_record_id ?? null,
        inheritanceStatus: args.status,
        isLocal: args.status === 'LOCAL',
        isInherited: args.status === 'INHERITED',
        isOverridden: args.status === 'OVERRIDDEN',
        isHidden: args.status === 'HIDDEN',
    };
}

export async function resolveParentScope(
    dbClient: DbClient,
    institutionId: string,
): Promise<ResolveParentScopeResult> {
    const record = await dbClient
        .selectFrom('institutions')
        .select(['id', 'parent_institution_id', 'institution_kind'])
        .where('id', '=', institutionId)
        .executeTakeFirstOrThrow();

    return {
        institutionId: record.id,
        parentInstitutionId: record.parent_institution_id ?? null,
        institutionKind: record.institution_kind ?? 'STANDALONE',
    };
}

export function mergeEffectiveRows<T extends InheritableRow>(
    parentRows: T[],
    childRows: T[],
    args: {
        idKey: keyof T & string;
        effectiveInstitutionId: string;
    },
) {
    const childBySource = new Map<string, T>();
    const localRows: T[] = [];

    for (const childRow of childRows) {
        if (childRow.source_record_id) {
            childBySource.set(String(childRow.source_record_id), childRow);
            continue;
        }

        localRows.push(childRow);
    }

    const effectiveRows: Array<EffectiveRow<T>> = [];

    for (const parentRow of parentRows) {
        const parentId = getRecordId(parentRow, args.idKey);
        const childOverride = childBySource.get(parentId);

        if (childOverride) {
            const status = childOverride.inheritance_status ?? 'OVERRIDDEN';

            if (status === 'HIDDEN') {
                effectiveRows.push(
                    toMetadata(childOverride, {
                        effectiveInstitutionId: args.effectiveInstitutionId,
                        status: 'HIDDEN',
                        sourceRecordId: parentId,
                    }),
                );
                continue;
            }

            effectiveRows.push(
                toMetadata(childOverride, {
                    effectiveInstitutionId: args.effectiveInstitutionId,
                    status: 'OVERRIDDEN',
                    sourceRecordId: parentId,
                }),
            );
            continue;
        }

        effectiveRows.push(
            toMetadata(parentRow, {
                effectiveInstitutionId: args.effectiveInstitutionId,
                status: 'INHERITED',
                sourceRecordId: parentId,
            }),
        );
    }

    for (const localRow of localRows) {
        effectiveRows.push(
            toMetadata(localRow, {
                effectiveInstitutionId: args.effectiveInstitutionId,
                status: 'LOCAL',
                sourceRecordId: null,
            }),
        );
    }

    return effectiveRows.filter((row) => !row.isHidden);
}

export function decorateWithOriginMetadata<T extends InheritableRow>(
    rows: T[],
    args: {
        idKey: keyof T & string;
        effectiveInstitutionId: string | null;
    },
) {
    return rows.map((row) => {
        const storedStatus = row.inheritance_status ?? 'LOCAL';
        const status: InheritanceStatus =
            storedStatus === 'OVERRIDDEN' || storedStatus === 'HIDDEN' ? storedStatus : 'LOCAL';

        return toMetadata(row, {
            effectiveInstitutionId: args.effectiveInstitutionId,
            status,
            sourceRecordId: getResolutionKey(row, args.idKey),
        });
    });
}
