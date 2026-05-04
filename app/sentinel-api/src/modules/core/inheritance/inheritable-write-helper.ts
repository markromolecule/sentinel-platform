import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { resolveParentScope } from './inheritance-resolver.helper';

type InheritableRecord = {
    institution_id?: string | null;
    source_record_id?: string | null;
    inheritance_status?: 'LOCAL' | 'OVERRIDDEN' | 'HIDDEN' | null;
    [key: string]: any;
};

type InheritableWriteConfig = {
    table: string;
    idColumn: string;
    copyColumns: string[];
};

type ResolvedWriteTarget =
    | {
          kind: 'direct';
          record: InheritableRecord;
      }
    | {
          kind: 'inherited';
          record: InheritableRecord;
          parentRecordId: string;
          childInstitutionId: string;
      };

async function getRecordById(
    dbClient: DbClient,
    config: InheritableWriteConfig,
    id: string,
): Promise<InheritableRecord | undefined> {
    return await (dbClient as any)
        .selectFrom(config.table)
        .selectAll()
        .where(config.idColumn, '=', id)
        .executeTakeFirst();
}

async function getOverrideRecord(
    dbClient: DbClient,
    config: InheritableWriteConfig,
    args: {
        institutionId: string;
        sourceRecordId: string;
    },
): Promise<InheritableRecord | undefined> {
    return await (dbClient as any)
        .selectFrom(config.table)
        .selectAll()
        .where('institution_id', '=', args.institutionId)
        .where('source_record_id', '=', args.sourceRecordId)
        .executeTakeFirst();
}

function copyInheritedValues(record: InheritableRecord, columns: string[]) {
    return columns.reduce<Record<string, unknown>>((values, column) => {
        values[column] = record[column] ?? null;
        return values;
    }, {});
}

async function resolveWriteTarget(
    dbClient: DbClient,
    config: InheritableWriteConfig,
    args: {
        id: string;
        institutionId?: string;
    },
): Promise<ResolvedWriteTarget> {
    const record = await getRecordById(dbClient, config, args.id);

    if (!record) {
        throw new HTTPException(404, { message: 'Record not found' });
    }

    if (!args.institutionId || record.institution_id === args.institutionId) {
        return {
            kind: 'direct',
            record,
        };
    }

    const scope = await resolveParentScope(dbClient, args.institutionId);

    if (scope.parentInstitutionId && record.institution_id === scope.parentInstitutionId) {
        return {
            kind: 'inherited',
            record,
            parentRecordId: String(record[config.idColumn]),
            childInstitutionId: args.institutionId,
        };
    }

    throw new HTTPException(404, { message: 'Record not found' });
}

export async function upsertInheritedOverride(args: {
    dbClient: DbClient;
    config: InheritableWriteConfig;
    id: string;
    institutionId?: string;
    values: Record<string, unknown>;
    actorId?: string | null;
}) {
    const target = await resolveWriteTarget(args.dbClient, args.config, {
        id: args.id,
        institutionId: args.institutionId,
    });

    if (target.kind === 'direct') {
        return null;
    }

    const existingOverride = await getOverrideRecord(args.dbClient, args.config, {
        institutionId: target.childInstitutionId,
        sourceRecordId: target.parentRecordId,
    });

    const overrideValues = {
        ...args.values,
        inheritance_status: 'OVERRIDDEN',
        hidden_at: null,
        hidden_by: null,
        updated_by: args.actorId ?? (args.values.updated_by as string | null | undefined) ?? null,
        updated_at: new Date(),
    };

    if (existingOverride) {
        return await (args.dbClient as any)
            .updateTable(args.config.table)
            .set(overrideValues)
            .where(args.config.idColumn, '=', existingOverride[args.config.idColumn])
            .returningAll()
            .executeTakeFirstOrThrow();
    }

    return await (args.dbClient as any)
        .insertInto(args.config.table)
        .values({
            ...copyInheritedValues(target.record, args.config.copyColumns),
            ...args.values,
            institution_id: target.childInstitutionId,
            source_record_id: target.parentRecordId,
            inheritance_status: 'OVERRIDDEN',
            created_by:
                args.actorId ??
                (args.values.updated_by as string | null | undefined) ??
                target.record.created_by ??
                null,
            updated_by:
                args.actorId ?? (args.values.updated_by as string | null | undefined) ?? null,
            created_at: new Date(),
            updated_at: new Date(),
        })
        .returningAll()
        .executeTakeFirstOrThrow();
}

export async function hideInheritedRecord(args: {
    dbClient: DbClient;
    config: InheritableWriteConfig;
    id: string;
    institutionId?: string;
    actorId?: string | null;
}) {
    const target = await resolveWriteTarget(args.dbClient, args.config, {
        id: args.id,
        institutionId: args.institutionId,
    });

    if (target.kind === 'direct') {
        return null;
    }

    const existingOverride = await getOverrideRecord(args.dbClient, args.config, {
        institutionId: target.childInstitutionId,
        sourceRecordId: target.parentRecordId,
    });

    const hiddenValues = {
        inheritance_status: 'HIDDEN',
        hidden_at: new Date(),
        hidden_by: args.actorId ?? null,
        updated_by: args.actorId ?? null,
        updated_at: new Date(),
    };

    if (existingOverride) {
        return await (args.dbClient as any)
            .updateTable(args.config.table)
            .set(hiddenValues)
            .where(args.config.idColumn, '=', existingOverride[args.config.idColumn])
            .returningAll()
            .executeTakeFirstOrThrow();
    }

    return await (args.dbClient as any)
        .insertInto(args.config.table)
        .values({
            ...copyInheritedValues(target.record, args.config.copyColumns),
            institution_id: target.childInstitutionId,
            source_record_id: target.parentRecordId,
            inheritance_status: 'HIDDEN',
            hidden_at: new Date(),
            hidden_by: args.actorId ?? null,
            created_by: args.actorId ?? target.record.created_by ?? null,
            updated_by: args.actorId ?? null,
            created_at: new Date(),
            updated_at: new Date(),
        })
        .returningAll()
        .executeTakeFirstOrThrow();
}
