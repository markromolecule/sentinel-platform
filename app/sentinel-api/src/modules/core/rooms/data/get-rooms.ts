import { type DbClient } from '@sentinel/db';

// Type for getRoomsData function arguments
export type GetRoomsDataArgs = {
    dbClient: DbClient;
    institutionId?: string;
    search?: string;
};

// Get all rooms from the rooms table
export async function getRoomsData({ dbClient, institutionId, search }: GetRoomsDataArgs) {
    let query = dbClient
        .selectFrom('rooms as r')
        .leftJoin('institutions as inst', 'inst.id', 'r.institution_id')
        .leftJoin('user_profiles as creator', 'creator.user_id', 'r.created_by')
        .leftJoin('user_profiles as updater', 'updater.user_id', 'r.updated_by')
        .select([
            'r.institution_id',
            'inst.name as institution_name',
            'r.room_id',
            'r.room_name',
            'r.room_code',
            'r.room_number',
            'r.room_type',
            'r.status',
            'r.source_record_id',
            'r.inheritance_status',
            'r.overridden_at',
            'r.overridden_by',
            'r.hidden_at',
            'r.hidden_by',
            'r.created_at',
            'r.created_by',
            'r.updated_at',
            'r.updated_by',
            'creator.first_name as creator_first_name',
            'creator.last_name as creator_last_name',
            'updater.first_name as updater_first_name',
            'updater.last_name as updater_last_name',
        ]);

    if (institutionId) {
        query = query.where('r.institution_id', '=', institutionId);
    }

    if (search) {
        query = query.where((eb) =>
            eb.or([
                eb('r.room_name', 'ilike', `%${search}%`),
                eb('r.room_code', 'ilike', `%${search}%`),
                eb('r.room_number', 'ilike', `%${search}%`),
                eb('inst.name', 'ilike', `%${search}%`),
            ]),
        );
    }

    const records = await query.orderBy('r.room_name', 'asc').execute();

    return records;
}

export type GetRoomsDataResponse = Awaited<ReturnType<typeof getRoomsData>>;
