import { type DbClient } from '@sentinel/db';
import { getRoomsData } from '../data/get-rooms';
import { loadEffectiveRows } from '../../inheritance/effective-row-loader';

export type GetRoomsServiceArgs = {
    dbClient: DbClient;
    institutionId?: string;
    search?: string;
};

export async function getRoomsService({ dbClient, institutionId, search }: GetRoomsServiceArgs) {
    const rawRooms = await loadEffectiveRows<any>({
        dbClient,
        institutionId,
        idKey: 'room_id',
        loadRows: (scopeInstitutionId) =>
            getRoomsData({ dbClient, institutionId: scopeInstitutionId, search }),
    });

    return rawRooms.map((room: any) => ({
        institution_id: room.institution_id,
        institution_name: room.institution_name ?? null,
        room_id: room.room_id,
        room_name: room.room_name,
        room_code: room.room_code,
        room_number: room.room_number,
        room_type: room.room_type,
        source_record_id: room.sourceRecordId,
        inheritance_status: room.inheritanceStatus,
        origin_institution_id: room.originInstitutionId,
        effective_institution_id: room.effectiveInstitutionId,
        is_local: room.isLocal,
        is_inherited: room.isInherited,
        is_overridden: room.isOverridden,
        is_hidden: room.isHidden,
        isLocal: room.isLocal,
        isInherited: room.isInherited,
        isOverridden: room.isOverridden,
        isHidden: room.isHidden,
        created_at: room.created_at,
        created_by: room.creator_first_name
            ? `${room.creator_first_name} ${room.creator_last_name}`
            : room.created_by,
        updated_at: room.updated_at,
        updated_by: room.updater_first_name
            ? `${room.updater_first_name} ${room.updater_last_name}`
            : room.updated_by,
    }));
}
