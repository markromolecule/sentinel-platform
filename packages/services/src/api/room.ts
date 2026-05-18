import { Room, RoomInput, RoomStatus } from '@sentinel/shared/types';
import type { ApiClientType } from '../api-client';

// Backend returns snake_case format
interface ApiRoom {
    room_id: string;
    room_name: string;
    room_code: string | null;
    room_number: string;
    institution_id: string | null;
    institution_name: string | null;
    room_type: 'LECTURE' | 'LABORATORY' | 'VIRTUAL';
    status: RoomStatus;
    created_at: string | null;
    created_by: string | null;
    updated_at: string | null;
    updated_by: string | null;
    source_record_id?: string | null;
    inheritance_status?: string;
    origin_institution_id?: string | null;
    effective_institution_id?: string | null;
    is_local?: boolean;
    is_inherited?: boolean;
    is_overridden?: boolean;
    is_hidden?: boolean;
}

// api response interface
interface ApiResponse<T> {
    message: string;
    data: T;
}

// map the api response to the room type
function mapRoom(apiRoom: ApiRoom): Room {
    return {
        id: apiRoom.room_id,
        name: apiRoom.room_name?.trim(),
        code: apiRoom.room_code,
        room_number: apiRoom.room_number,
        institution: apiRoom.institution_name,
        institutionId: apiRoom.institution_id,
        room_type: apiRoom.room_type,
        status: apiRoom.status,
        createdAt: apiRoom.created_at || new Date().toISOString(),
        createdBy: apiRoom.created_by ?? '',
        updatedAt: apiRoom.updated_at || new Date().toISOString(),
        updatedBy: apiRoom.updated_by || '',
        sourceRecordId: apiRoom.source_record_id ?? null,
        inheritanceStatus: apiRoom.inheritance_status,
        originInstitutionId: apiRoom.origin_institution_id ?? null,
        effectiveInstitutionId: apiRoom.effective_institution_id ?? null,
        isLocal: apiRoom.is_local,
        isInherited: apiRoom.is_inherited,
        isOverridden: apiRoom.is_overridden,
        isHidden: apiRoom.is_hidden,
    };
}

// get all rooms
export async function getRooms(
    apiClient: ApiClientType,
    search?: string,
    institutionId?: string,
): Promise<Room[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (institutionId) params.append('institutionId', institutionId);

    const queryString = params.toString();
    const url = queryString ? `/rooms?${queryString}` : '/rooms';

    const response: ApiResponse<ApiRoom[]> = await apiClient(url);
    return response.data.map(mapRoom);
}

// create a room
export async function createRoom(apiClient: ApiClientType, payload: RoomInput): Promise<Room> {
    const response: ApiResponse<ApiRoom> = await apiClient('/rooms', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    return mapRoom(response.data);
}

// update a room
export async function updateRoom(
    apiClient: ApiClientType,
    {
        id,
        payload,
    }: {
        id: string;
        payload: Partial<RoomInput>;
    },
): Promise<Room> {
    const response: ApiResponse<ApiRoom> = await apiClient(`/rooms/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    return mapRoom(response.data);
}

// delete a room
export async function deleteRoom(apiClient: ApiClientType, id: string): Promise<void> {
    await apiClient(`/rooms/${id}`, {
        method: 'DELETE',
    });
}

// delete multiple rooms
export async function deleteRooms(apiClient: ApiClientType, ids: string[]): Promise<void> {
    await apiClient('/rooms/bulk-delete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids }),
    });
}

// bulk create rooms
export async function bulkCreateRooms(
    apiClient: ApiClientType,
    rooms: RoomInput[],
): Promise<Room[]> {
    const response: ApiResponse<ApiRoom[]> = await apiClient('/rooms/bulk', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rooms }),
    });
    return response.data.map(mapRoom);
}
