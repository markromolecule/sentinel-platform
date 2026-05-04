import { Room, RoomType } from '../../index';

export type RoomStoreState = {
    rooms: Room[];
};

export type RoomInput = {
    name: string;
    code?: string | null;
    room_number: string;
    room_type: RoomType;
    institution_id?: string | null;
};
