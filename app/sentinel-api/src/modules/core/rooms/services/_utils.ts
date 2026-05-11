import { type DbClient } from '@sentinel/db';

export const ROOM_INHERITANCE_CONFIG = {
    table: 'rooms',
    idColumn: 'room_id',
    copyColumns: ['room_name', 'room_code', 'room_number', 'room_type', 'created_by', 'updated_by'],
};

export function buildRoomLabel(
    name: string | null | undefined,
    code: string | null | undefined,
    number?: string | null,
) {
    const base = name || code || 'Room';
    return number ? `${base} (${number})` : base;
}

export async function getRoomSummaryById(dbClient: DbClient, id: string, institutionId?: string) {
    let query = dbClient
        .selectFrom('rooms')
        .select(['room_id', 'room_name', 'room_code', 'room_number', 'institution_id'])
        .where('room_id', '=', id);

    if (institutionId) {
        query = query.where('institution_id', '=', institutionId);
    }

    return await query.executeTakeFirst();
}

export async function getInstitutionName(dbClient: DbClient, institutionId?: string | null) {
    if (!institutionId) {
        return null;
    }

    const institution = await dbClient
        .selectFrom('institutions')
        .select('name')
        .where('id', '=', institutionId)
        .executeTakeFirst();

    return institution?.name ?? null;
}
