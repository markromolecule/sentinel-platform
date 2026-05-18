import { format } from 'date-fns';
import type { ProctorExam, Room } from '@sentinel/shared/types';

const ROOM_TYPE_LABELS: Record<Room['room_type'], string> = {
    LECTURE: 'Lecture Rooms',
    LABORATORY: 'Laboratories',
    VIRTUAL: 'Virtual Rooms',
};

const ROOM_TYPE_ORDER: Record<Room['room_type'], number> = {
    LECTURE: 0,
    LABORATORY: 1,
    VIRTUAL: 2,
};

export type RoomConflictState = {
    examId: string;
    examTitle: string;
    timeLabel: string;
};

export type RoomOption = {
    room: Room;
    groupLabel: string;
    searchValue: string;
    metaLabel: string;
    isUnavailable: boolean;
    conflict?: RoomConflictState;
};

export type RoomOptionGroup = {
    heading: string;
    options: RoomOption[];
};

function parseDateTime(value?: string | Date | null) {
    if (!value) {
        return null;
    }

    const parsed = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(parsed.getTime())) {
        return null;
    }

    return parsed;
}

function formatConflictWindow(startDateTime: Date, endDateTime: Date) {
    const startLabel = format(startDateTime, 'MMM d, h:mm a');
    const endLabel = format(endDateTime, 'h:mm a');

    return `${startLabel} - ${endLabel}`;
}

function buildRoomMetaLabel(room: Room) {
    return [room.room_number, room.code, room.room_type].filter(Boolean).join(' • ');
}

function buildRoomSearchValue(room: Room) {
    return [room.name, room.code, room.room_number, room.room_type].filter(Boolean).join(' ');
}

function compareRooms(left: RoomOption, right: RoomOption) {
    const groupOrderDifference =
        ROOM_TYPE_ORDER[left.room.room_type] - ROOM_TYPE_ORDER[right.room.room_type];

    if (groupOrderDifference !== 0) {
        return groupOrderDifference;
    }

    const leftPrimary = `${left.room.room_number} ${left.room.code ?? ''} ${left.room.name}`
        .trim()
        .toLowerCase();
    const rightPrimary = `${right.room.room_number} ${right.room.code ?? ''} ${right.room.name}`
        .trim()
        .toLowerCase();

    return leftPrimary.localeCompare(rightPrimary);
}

function buildRoomConflictMap(args: {
    exams: Pick<ProctorExam, 'id' | 'title' | 'roomId' | 'scheduledDate' | 'endDateTime'>[];
    startDateTime?: string | null;
    endDateTime?: string | null;
    currentExamId?: string;
}) {
    const requestStart = parseDateTime(args.startDateTime);
    const requestEnd = parseDateTime(args.endDateTime);

    if (!requestStart || !requestEnd) {
        return new Map<string, RoomConflictState>();
    }

    const conflictsByRoomId = new Map<string, RoomConflictState>();

    for (const exam of args.exams) {
        if (!exam.roomId || exam.id === args.currentExamId) {
            continue;
        }

        const examStart = parseDateTime(exam.scheduledDate);
        const examEnd = parseDateTime(exam.endDateTime);

        if (!examStart || !examEnd) {
            continue;
        }

        const overlaps = examStart < requestEnd && examEnd > requestStart;

        if (!overlaps || conflictsByRoomId.has(exam.roomId)) {
            continue;
        }

        conflictsByRoomId.set(exam.roomId, {
            examId: exam.id,
            examTitle: exam.title,
            timeLabel: formatConflictWindow(examStart, examEnd),
        });
    }

    return conflictsByRoomId;
}

export function getSelectedRoomLabel(option?: RoomOption) {
    if (!option) {
        return '';
    }

    return [option.room.name, option.room.room_number, option.room.code]
        .filter(Boolean)
        .join(' • ');
}

export function buildRoomOptionGroups(args: {
    rooms: Room[];
    exams: Pick<ProctorExam, 'id' | 'title' | 'roomId' | 'scheduledDate' | 'endDateTime'>[];
    startDateTime?: string | null;
    endDateTime?: string | null;
    currentExamId?: string;
}) {
    const conflictsByRoomId = buildRoomConflictMap(args);

    const roomOptions = args.rooms
        .map<RoomOption>((room) => ({
            room,
            groupLabel: ROOM_TYPE_LABELS[room.room_type],
            searchValue: buildRoomSearchValue(room),
            metaLabel: buildRoomMetaLabel(room),
            isUnavailable:
                conflictsByRoomId.has(room.id) ||
                room.status === 'ASSIGNED' ||
                room.status === 'MAINTENANCE',
            conflict: conflictsByRoomId.get(room.id),
        }))
        .sort(compareRooms);

    return roomOptions.reduce<RoomOptionGroup[]>((groups, option) => {
        const currentGroup = groups[groups.length - 1];

        if (!currentGroup || currentGroup.heading !== option.groupLabel) {
            groups.push({
                heading: option.groupLabel,
                options: [option],
            });
            return groups;
        }

        currentGroup.options.push(option);
        return groups;
    }, []);
}
