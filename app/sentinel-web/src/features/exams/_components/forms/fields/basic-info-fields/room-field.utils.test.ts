import { describe, expect, it } from 'vitest';
import type { ProctorExam, Room } from '@sentinel/shared/types';
import { buildRoomOptionGroups } from './room-field.utils';

const rooms: Room[] = [
    {
        id: 'room-lecture-2',
        name: 'North Hall',
        code: 'NH-202',
        room_number: '202',
        room_type: 'LECTURE',
    },
    {
        id: 'room-lab-1',
        name: 'Chemistry Lab',
        code: 'LAB-1',
        room_number: '101',
        room_type: 'LABORATORY',
    },
    {
        id: 'room-lecture-1',
        name: 'Main Hall',
        code: 'MH-101',
        room_number: '101',
        room_type: 'LECTURE',
    },
];

const exams: Pick<ProctorExam, 'id' | 'title' | 'roomId' | 'scheduledDate' | 'endDateTime'>[] = [
    {
        id: 'exam-1',
        title: 'Physics Midterm',
        roomId: 'room-lecture-1',
        scheduledDate: '2026-05-08T01:00:00.000Z',
        endDateTime: '2026-05-08T03:00:00.000Z',
    },
    {
        id: 'exam-2',
        title: 'Chemistry Practical',
        roomId: 'room-lab-1',
        scheduledDate: '2026-05-08T04:00:00.000Z',
        endDateTime: '2026-05-08T05:00:00.000Z',
    },
];

describe('room field utilities', () => {
    it('groups and sorts rooms by room type and room metadata', () => {
        const groups = buildRoomOptionGroups({
            rooms,
            exams: [],
        });

        expect(groups.map((group) => group.heading)).toEqual(['Lecture Rooms', 'Laboratories']);
        expect(groups[0]?.options.map((option) => option.room.id)).toEqual([
            'room-lecture-1',
            'room-lecture-2',
        ]);
    });

    it('marks only overlapping rooms as unavailable and ignores the current exam id', () => {
        const groups = buildRoomOptionGroups({
            rooms,
            exams,
            startDateTime: '2026-05-08T02:00:00.000Z',
            endDateTime: '2026-05-08T04:00:00.000Z',
            currentExamId: 'exam-2',
        });

        const options = groups.flatMap((group) => group.options);

        expect(options.find((option) => option.room.id === 'room-lecture-1')).toMatchObject({
            isUnavailable: true,
            conflict: {
                examTitle: 'Physics Midterm',
            },
        });
        expect(options.find((option) => option.room.id === 'room-lab-1')).toMatchObject({
            isUnavailable: false,
        });
    });
});
