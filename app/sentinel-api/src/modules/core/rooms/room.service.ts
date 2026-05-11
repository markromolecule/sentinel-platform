import { getRoomsData } from './data/get-rooms';
import { createRoomData } from './data/create-room';
import { updateRoomData } from './data/update-room';
import { deleteRoomData } from './data/delete-room';
import { deleteRoomsData } from './data/delete-rooms';
import { type DbClient } from '@sentinel/db';
import { type CreateRoomBody, type UpdateRoomBody } from './room.dto';
import { HTTPException } from 'hono/http-exception';
import { loadEffectiveRows } from '../inheritance/effective-row-loader';
import {
    hideInheritedRecord,
    upsertInheritedOverride,
} from '../inheritance/inheritable-write-helper';
import { ActivityNotificationService } from '../../general/notification/services/activity-notification.service';

const ROOM_INHERITANCE_CONFIG = {
    table: 'rooms',
    idColumn: 'room_id',
    copyColumns: ['room_name', 'room_code', 'room_number', 'room_type', 'created_by', 'updated_by'],
};

function buildRoomLabel(
    name: string | null | undefined,
    code: string | null | undefined,
    number?: string | null,
) {
    const base = name || code || 'Room';
    return number ? `${base} (${number})` : base;
}

export class RoomService {
    private static async getRoomSummaryById(
        dbClient: DbClient,
        id: string,
        institutionId?: string,
    ) {
        let query = dbClient
            .selectFrom('rooms')
            .select(['room_id', 'room_name', 'room_code', 'room_number', 'institution_id'])
            .where('room_id', '=', id);

        if (institutionId) {
            query = query.where('institution_id', '=', institutionId);
        }

        return await query.executeTakeFirst();
    }

    private static async getInstitutionName(dbClient: DbClient, institutionId?: string | null) {
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

    static async getRooms(dbClient: DbClient, institutionId?: string, search?: string) {
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

    static async createRoom(
        dbClient: DbClient,
        data: CreateRoomBody,
        createdBy: string,
        institutionId?: string,
    ) {
        const targetInstitutionId =
            institutionId && institutionId !== '' ? institutionId : data.institution_id;

        if (!targetInstitutionId || targetInstitutionId === '') {
            console.error(
                `Attempted to create room for user ${createdBy} without an institutionId`,
            );
            throw new HTTPException(403, {
                message:
                    'Your account is not associated with an institution. Please contact your administrator.',
            });
        }

        try {
            const rawRoom = await createRoomData({
                dbClient,
                values: {
                    room_name: data.name,
                    room_code: data.code ?? null,
                    room_number: data.room_number,
                    room_type: data.room_type || 'LECTURE',
                    created_by: createdBy,
                    institution_id: targetInstitutionId,
                },
            });

            const institutionName = await this.getInstitutionName(dbClient, rawRoom.institution_id);
            const room = {
                institution_id: rawRoom.institution_id,
                institution_name: institutionName,
                room_id: rawRoom.room_id,
                room_name: rawRoom.room_name,
                room_code: rawRoom.room_code,
                room_number: rawRoom.room_number,
                room_type: rawRoom.room_type,
                created_at: rawRoom.created_at,
                created_by: rawRoom.created_by,
                updated_at: rawRoom.updated_at,
                updated_by: rawRoom.updated_by,
            };
            const roomLabel = buildRoomLabel(
                rawRoom.room_name,
                rawRoom.room_code,
                rawRoom.room_number,
            );
            await ActivityNotificationService.notifyGenericInstitutionActivity({
                dbClient,
                actorUserId: createdBy,
                institutionId: targetInstitutionId,
                operation: 'CREATED',
                targetType: 'ROOM',
                targetId: rawRoom.room_id,
                targetLabel: roomLabel,
                title: 'Room created',
                message: `A room was created: "${roomLabel}".`,
                sourceModule: 'rooms',
                sourceAction: 'create',
                metadata: {
                    roomId: rawRoom.room_id,
                },
            });

            return room;
        } catch (error: any) {
            const code = error?.code ?? error?.cause?.code;
            const message = error?.message || '';

            if (
                code === 'P2002' ||
                code === '23505' ||
                (code === 'P2010' && message.includes('23505'))
            ) {
                throw new HTTPException(409, {
                    message: 'Room already exists with this name in the selected institution.',
                });
            }
            throw error;
        }
    }

    static async updateRoom(
        dbClient: DbClient,
        id: string,
        data: UpdateRoomBody,
        updatedBy: string,
        institutionId?: string,
    ) {
        const currentScopeInstitutionId = institutionId;
        const targetInstitutionId =
            institutionId && institutionId !== '' ? institutionId : data.institution_id;

        if (!targetInstitutionId || targetInstitutionId === '') {
            console.error(
                `Attempted to update room ${id} for user ${updatedBy} without an institutionId`,
            );
            throw new HTTPException(403, {
                message:
                    'Your account is not associated with an institution. Please contact your administrator.',
            });
        }

        try {
            const overrideRoom = await upsertInheritedOverride({
                dbClient,
                config: ROOM_INHERITANCE_CONFIG,
                id,
                institutionId:
                    currentScopeInstitutionId && currentScopeInstitutionId !== ''
                        ? currentScopeInstitutionId
                        : targetInstitutionId,
                actorId: updatedBy,
                values: {
                    ...(data.name !== undefined ? { room_name: data.name } : {}),
                    ...(data.code !== undefined ? { room_code: data.code } : {}),
                    ...(data.room_number !== undefined ? { room_number: data.room_number } : {}),
                    ...(data.room_type !== undefined ? { room_type: data.room_type } : {}),
                    updated_by: updatedBy,
                    updated_at: new Date(),
                },
            });

            if (overrideRoom) {
                const institutionName = await this.getInstitutionName(
                    dbClient,
                    overrideRoom.institution_id,
                );

                return {
                    institution_id: overrideRoom.institution_id,
                    institution_name: institutionName,
                    room_id: overrideRoom.room_id,
                    room_name: overrideRoom.room_name,
                    room_code: overrideRoom.room_code,
                    room_number: overrideRoom.room_number,
                    room_type: overrideRoom.room_type,
                    created_at: overrideRoom.created_at,
                    created_by: overrideRoom.created_by,
                    updated_at: overrideRoom.updated_at,
                    updated_by: overrideRoom.updated_by,
                };
            }

            const rawRoom = await updateRoomData({
                dbClient,
                id,
                values: {
                    ...(data.name !== undefined ? { room_name: data.name } : {}),
                    ...(data.code !== undefined ? { room_code: data.code } : {}),
                    ...(data.room_number !== undefined ? { room_number: data.room_number } : {}),
                    ...(data.room_type !== undefined ? { room_type: data.room_type } : {}),
                    ...(targetInstitutionId !== undefined
                        ? { institution_id: targetInstitutionId }
                        : {}),
                    updated_by: updatedBy,
                    updated_at: new Date().toISOString(),
                },
                institutionId:
                    currentScopeInstitutionId && currentScopeInstitutionId !== ''
                        ? currentScopeInstitutionId
                        : targetInstitutionId,
            });

            const institutionName = await this.getInstitutionName(dbClient, rawRoom.institution_id);
            const room = {
                institution_id: rawRoom.institution_id,
                institution_name: institutionName,
                room_id: rawRoom.room_id,
                room_name: rawRoom.room_name,
                room_code: rawRoom.room_code,
                room_number: rawRoom.room_number,
                room_type: rawRoom.room_type,
                created_at: rawRoom.created_at,
                created_by: rawRoom.created_by,
                updated_at: rawRoom.updated_at,
                updated_by: rawRoom.updated_by,
            };
            const roomLabel = buildRoomLabel(
                rawRoom.room_name,
                rawRoom.room_code,
                rawRoom.room_number,
            );
            await ActivityNotificationService.notifyGenericInstitutionActivity({
                dbClient,
                actorUserId: updatedBy,
                institutionId:
                    currentScopeInstitutionId && currentScopeInstitutionId !== ''
                        ? currentScopeInstitutionId
                        : targetInstitutionId,
                operation: 'UPDATED',
                targetType: 'ROOM',
                targetId: rawRoom.room_id,
                targetLabel: roomLabel,
                title: 'Room updated',
                message: `A room was updated: "${roomLabel}".`,
                sourceModule: 'rooms',
                sourceAction: 'update',
                metadata: {
                    roomId: rawRoom.room_id,
                },
            });

            return room;
        } catch (error: any) {
            const code = error?.code ?? error?.cause?.code;
            if (code === 'P2002' || code === '23505') {
                throw new HTTPException(409, { message: 'Room name already exists' });
            }
            if (error.name === 'NotFoundError') {
                throw new HTTPException(404, { message: 'Room not found' });
            }
            throw error;
        }
    }

    static async deleteRoom(
        dbClient: DbClient,
        id: string,
        deletedBy: string,
        institutionId?: string,
    ) {
        if (institutionId === '') {
            console.error(
                `Attempted to delete room ${id} for user ${deletedBy} without an institutionId`,
            );
            throw new HTTPException(403, {
                message:
                    'Your account is not associated with an institution. Please contact your administrator.',
            });
        }

        try {
            const existingRoom = await this.getRoomSummaryById(dbClient, id, institutionId);
            const hiddenRoom = await hideInheritedRecord({
                dbClient,
                config: ROOM_INHERITANCE_CONFIG,
                id,
                institutionId,
                actorId: deletedBy,
            });

            if (hiddenRoom) {
                if (institutionId) {
                    const roomLabel = buildRoomLabel(
                        hiddenRoom.room_name,
                        hiddenRoom.room_code,
                        hiddenRoom.room_number,
                    );
                    await ActivityNotificationService.notifyGenericInstitutionActivity({
                        dbClient,
                        actorUserId: deletedBy,
                        institutionId,
                        operation: 'OVERRIDE_COMPLETED',
                        targetType: 'ROOM',
                        targetId: hiddenRoom.room_id,
                        targetLabel: roomLabel,
                        title: 'Room override applied',
                        message: `A room override was applied to "${roomLabel}".`,
                        sourceModule: 'rooms',
                        sourceAction: 'hide-inherited',
                        isAdminOverride: true,
                        metadata: {
                            roomId: hiddenRoom.room_id,
                        },
                    });
                }
                return hiddenRoom;
            }

            const deletedRoom = await deleteRoomData({ dbClient, id, institutionId });

            if (institutionId) {
                const roomLabel = buildRoomLabel(
                    existingRoom?.room_name,
                    existingRoom?.room_code,
                    existingRoom?.room_number,
                );
                await ActivityNotificationService.notifyGenericInstitutionActivity({
                    dbClient,
                    actorUserId: deletedBy,
                    institutionId,
                    operation: 'DELETED',
                    targetType: 'ROOM',
                    targetId: id,
                    targetLabel: roomLabel,
                    title: 'Room deleted',
                    message: `A room was deleted: "${roomLabel}".`,
                    sourceModule: 'rooms',
                    sourceAction: 'delete',
                    metadata: {
                        roomId: id,
                    },
                });
            }

            return deletedRoom;
        } catch (error: any) {
            const code = error?.code ?? error?.cause?.code;
            const message = error?.message ?? '';
            if (
                code === 'P2003' ||
                code === '23503' ||
                (code === 'P2010' && message.includes('23503'))
            ) {
                throw new HTTPException(409, {
                    message: 'Cannot delete room because it is being used.',
                });
            }
            if (error.name === 'NotFoundError') {
                throw new HTTPException(404, { message: 'Room not found' });
            }
            throw error;
        }
    }

    static async deleteRooms(
        dbClient: DbClient,
        ids: string[],
        institutionId?: string,
        actorUserId?: string,
    ) {
        try {
            const deletedRooms = await deleteRoomsData({ dbClient, ids, institutionId });

            if (actorUserId && institutionId && deletedRooms.length > 0) {
                const label = `${deletedRooms.length} room${deletedRooms.length === 1 ? '' : 's'}`;
                await ActivityNotificationService.notifyGenericInstitutionActivity({
                    dbClient,
                    actorUserId,
                    institutionId,
                    operation: 'DELETED',
                    targetType: 'ROOM',
                    targetLabel: label,
                    title: 'Rooms deleted',
                    message: `${label} were deleted.`,
                    sourceModule: 'rooms',
                    sourceAction: 'bulk-delete',
                    metadata: {
                        roomIds: ids,
                        count: deletedRooms.length,
                        bulk: true,
                    },
                });
            }

            return deletedRooms;
        } catch (error: any) {
            const code = error?.code ?? error?.cause?.code;
            const message = error?.message ?? '';
            if (
                code === 'P2003' ||
                code === '23503' ||
                (code === 'P2010' && message.includes('23503'))
            ) {
                throw new HTTPException(409, {
                    message: 'Cannot delete one or more rooms because they are currently in use.',
                });
            }
            throw error;
        }
    }
}
