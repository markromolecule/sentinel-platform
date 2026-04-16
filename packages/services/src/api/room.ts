import { Room, RoomInput } from '@sentinel/shared/types';
import type { ApiClientType } from '../api-client';

// Backend returns snake_case format
interface ApiRoom {
    room_id: string;
    room_name: string;
    room_code: string | null;
    institution_id: string | null;
    institution_name: string | null;
    room_type: 'LECTURE' | 'LABORATORY' | 'VIRTUAL';
    created_at: string | null;
    created_by: string | null;
    updated_at: string | null;
    updated_by: string | null;
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
        institution: apiRoom.institution_name,
        institutionId: apiRoom.institution_id,
        room_type: apiRoom.room_type,
        createdAt: apiRoom.created_at || new Date().toISOString(),
        createdBy: apiRoom.created_by ?? '',
        updatedAt: apiRoom.updated_at || new Date().toISOString(),
        updatedBy: apiRoom.updated_by || '',
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
