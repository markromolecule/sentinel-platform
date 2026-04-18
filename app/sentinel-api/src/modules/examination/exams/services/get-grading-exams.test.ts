import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DbClient } from '@sentinel/db';
import { getGradingExams } from './get-grading-exams';
import { getGradingExamsData } from '../data/get-grading-exams';

vi.mock('../data/get-grading-exams', () => ({
    getGradingExamsData: vi.fn(),
}));

describe('getGradingExams service', () => {
    const mockDb = {} as DbClient;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('passes user and filter arguments through to the data layer', async () => {
        vi.mocked(getGradingExamsData).mockResolvedValue([]);

        await getGradingExams({
            dbClient: mockDb,
            userId: 'user-1',
            institutionId: 'institution-1',
            sectionId: 'section-1',
        });

        expect(getGradingExamsData).toHaveBeenCalledWith({
            dbClient: mockDb,
            userId: 'user-1',
            institutionId: 'institution-1',
            sectionId: 'section-1',
        });
    });

    it('maps grading overview records using real submission progress', async () => {
        vi.mocked(getGradingExamsData).mockResolvedValue([
            {
                id: '11111111-1111-1111-1111-111111111111',
                title: 'Pending exam',
                subject: 'Math',
                scheduledDate: null,
                totalStudents: 25,
                submittedCount: 0,
                gradedCount: 0,
                sectionIds: ['aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'],
                sectionNames: ['BSCS 3A'],
            },
            {
                id: '22222222-2222-2222-2222-222222222222',
                title: 'In-progress exam',
                subject: 'Science',
                scheduledDate: new Date('2026-04-18T08:00:00.000Z'),
                totalStudents: 30,
                submittedCount: 10,
                gradedCount: 4,
                sectionIds: ['bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'],
                sectionNames: ['BSCS 3B'],
            },
            {
                id: '33333333-3333-3333-3333-333333333333',
                title: 'Completed exam',
                subject: 'History',
                scheduledDate: new Date('2026-04-19T08:00:00.000Z'),
                totalStudents: 18,
                submittedCount: 12,
                gradedCount: 12,
                sectionIds: ['cccccccc-cccc-cccc-cccc-cccccccccccc'],
                sectionNames: ['BSCS 3C'],
            },
        ]);

        const exams = await getGradingExams({
            dbClient: mockDb,
            userId: 'user-1',
        });

        expect(exams).toEqual([
            {
                id: '11111111-1111-1111-1111-111111111111',
                title: 'Pending exam',
                subject: 'Math',
                scheduledDate: null,
                totalStudents: 25,
                submittedCount: 0,
                gradedCount: 0,
                status: 'PENDING',
                sectionIds: ['aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'],
                sectionNames: ['BSCS 3A'],
            },
            {
                id: '22222222-2222-2222-2222-222222222222',
                title: 'In-progress exam',
                subject: 'Science',
                scheduledDate: '2026-04-18T08:00:00.000Z',
                totalStudents: 30,
                submittedCount: 10,
                gradedCount: 4,
                status: 'IN_PROGRESS',
                sectionIds: ['bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'],
                sectionNames: ['BSCS 3B'],
            },
            {
                id: '33333333-3333-3333-3333-333333333333',
                title: 'Completed exam',
                subject: 'History',
                scheduledDate: '2026-04-19T08:00:00.000Z',
                totalStudents: 18,
                submittedCount: 12,
                gradedCount: 12,
                status: 'COMPLETED',
                sectionIds: ['cccccccc-cccc-cccc-cccc-cccccccccccc'],
                sectionNames: ['BSCS 3C'],
            },
        ]);
    });
});
