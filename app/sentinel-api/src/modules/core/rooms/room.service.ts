import { type DbClient } from '@sentinel/db';
import { type CreateRoomBody, type UpdateRoomBody, type BulkCreateRoomsBody } from './room.dto';
import { getRoomsService } from './services/get-rooms.service';
import { createRoomService } from './services/create-room.service';
import { bulkCreateRoomsService } from './services/bulk-create-rooms.service';
import { updateRoomService } from './services/update-room.service';
import { deleteRoomService } from './services/delete-room.service';
import { deleteRoomsService } from './services/delete-rooms.service';
import { recalculateRoomStatus } from './services/recalculate-room-status';

export class RoomService {
    /**
     * Recalculates room availability status based on active exams.
     */
    static async recalculateRoomStatus(dbClient: DbClient, roomIds: string | string[]) {
        return recalculateRoomStatus(dbClient, roomIds);
    }
    /**
     * @deprecated Use getRoomsService directly
     */
    static async getRooms(dbClient: DbClient, institutionId?: string, search?: string) {
        return getRoomsService({ dbClient, institutionId, search });
    }

    /**
     * @deprecated Use createRoomService directly
     */
    static async createRoom(
        dbClient: DbClient,
        data: CreateRoomBody,
        createdBy: string,
        institutionId?: string,
    ) {
        return createRoomService({
            dbClient,
            data,
            createdBy,
            institutionId,
        });
    }

    /**
     * @deprecated Use bulkCreateRoomsService directly
     */
    static async bulkCreateRooms(
        dbClient: DbClient,
        data: BulkCreateRoomsBody,
        createdBy: string,
        institutionId?: string,
    ) {
        return bulkCreateRoomsService({
            dbClient,
            data,
            createdBy,
            institutionId,
        });
    }

    /**
     * @deprecated Use updateRoomService directly
     */
    static async updateRoom(
        dbClient: DbClient,
        id: string,
        data: UpdateRoomBody,
        updatedBy: string,
        institutionId?: string,
    ) {
        return updateRoomService({
            dbClient,
            id,
            data,
            updatedBy,
            institutionId,
        });
    }

    /**
     * @deprecated Use deleteRoomService directly
     */
    static async deleteRoom(
        dbClient: DbClient,
        id: string,
        deletedBy: string,
        institutionId?: string,
    ) {
        return deleteRoomService({
            dbClient,
            id,
            deletedBy,
            institutionId,
        });
    }

    /**
     * @deprecated Use deleteRoomsService directly
     */
    static async deleteRooms(
        dbClient: DbClient,
        ids: string[],
        institutionId?: string,
        actorUserId?: string,
    ) {
        return deleteRoomsService({
            dbClient,
            ids,
            institutionId,
            actorUserId,
        });
    }
}
