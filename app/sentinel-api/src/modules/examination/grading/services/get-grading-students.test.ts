import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DbClient } from '@sentinel/db';
import { getGradingStudents } from './get-grading-students.service';
import { getGradingStudentsData } from '../data/get-grading-students';

vi.mock('../data/get-grading-students', () => ({
    getGradingStudentsData: vi.fn(),
}));

describe('getGradingStudents service', () => {
    const mockDb = {} as DbClient;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('passes grading detail arguments through to the data layer', async () => {
        vi.mocked(getGradingStudentsData).mockResolvedValue([]);

        await getGradingStudents({
            dbClient: mockDb,
            examId: 'exam-1',
            userId: 'user-1',
            institutionId: 'institution-1',
            sectionId: 'section-1',
        });

        expect(getGradingStudentsData).toHaveBeenCalledWith({
            dbClient: mockDb,
            examId: 'exam-1',
            userId: 'user-1',
            institutionId: 'institution-1',
            sectionId: 'section-1',
        });
    });

    it('forwards the search argument to the data layer', async () => {
        vi.mocked(getGradingStudentsData).mockResolvedValue([]);

        await getGradingStudents({
            dbClient: mockDb,
            examId: 'exam-1',
            userId: 'user-1',
            search: 'alice',
        });

        expect(getGradingStudentsData).toHaveBeenCalledWith(
            expect.objectContaining({ search: 'alice' }),
        );
    });

    it('maps latest-attempt grading statuses and sorts students by name', async () => {
        vi.mocked(getGradingStudentsData).mockResolvedValue([
            {
                id: '11111111-1111-1111-1111-111111111111',
                name: 'Charlie Student',
                studentId: '2026-0003',
                sectionId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
                sectionName: 'BSCS 3A',
                attemptId: null,
                completed_at: null,
                score: null,
                maxScore: 100,
            },
            {
                id: '22222222-2222-2222-2222-222222222222',
                name: 'Alice Student',
                studentId: '2026-0001',
                sectionId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
                sectionName: 'BSCS 3A',
                attemptId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
                completed_at: new Date('2026-04-18T09:30:00.000Z'),
                score: 88,
                maxScore: 100,
            },
            {
                id: '33333333-3333-3333-3333-333333333333',
                name: 'Bob Student',
                studentId: '2026-0002',
                sectionId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
                sectionName: 'BSCS 3A',
                attemptId: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
                completed_at: new Date('2026-04-18T09:45:00.000Z'),
                score: null,
                maxScore: 100,
            },
            {
                id: '44444444-4444-4444-4444-444444444444',
                name: 'Dana Student',
                studentId: '2026-0004',
                sectionId: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
                sectionName: 'BSCS 3B',
                attemptId: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
                completed_at: new Date('2026-04-18T10:00:00.000Z'),
                score: 91,
                maxScore: 100,
            },
        ]);

        const gradingStudents = await getGradingStudents({
            dbClient: mockDb,
            examId: 'exam-1',
            userId: 'user-1',
        });

        expect(gradingStudents).toEqual({
            students: [
                {
                    id: '22222222-2222-2222-2222-222222222222',
                    name: 'Alice Student',
                    studentId: '2026-0001',
                    sectionId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
                    sectionName: 'BSCS 3A',
                    submissionDate: '2026-04-18T09:30:00.000Z',
                    score: 88,
                    maxScore: 100,
                    status: 'GRADED',
                    attemptId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
                },
                {
                    id: '33333333-3333-3333-3333-333333333333',
                    name: 'Bob Student',
                    studentId: '2026-0002',
                    sectionId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
                    sectionName: 'BSCS 3A',
                    submissionDate: '2026-04-18T09:45:00.000Z',
                    score: null,
                    maxScore: 100,
                    status: 'SUBMITTED',
                    attemptId: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
                },
                {
                    id: '11111111-1111-1111-1111-111111111111',
                    name: 'Charlie Student',
                    studentId: '2026-0003',
                    sectionId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
                    sectionName: 'BSCS 3A',
                    submissionDate: null,
                    score: null,
                    maxScore: 100,
                    status: 'NOT_SUBMITTED',
                    attemptId: null,
                },
                {
                    id: '44444444-4444-4444-4444-444444444444',
                    name: 'Dana Student',
                    studentId: '2026-0004',
                    sectionId: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
                    sectionName: 'BSCS 3B',
                    submissionDate: '2026-04-18T10:00:00.000Z',
                    score: 91,
                    maxScore: 100,
                    status: 'GRADED',
                    attemptId: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
                },
            ],
            sections: [
                {
                    sectionId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
                    sectionName: 'BSCS 3A',
                    totalStudents: 3,
                    submittedCount: 2,
                    gradedCount: 1,
                    students: [
                        {
                            id: '22222222-2222-2222-2222-222222222222',
                            name: 'Alice Student',
                            studentId: '2026-0001',
                            sectionId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
                            sectionName: 'BSCS 3A',
                            submissionDate: '2026-04-18T09:30:00.000Z',
                            score: 88,
                            maxScore: 100,
                            status: 'GRADED',
                            attemptId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
                        },
                        {
                            id: '33333333-3333-3333-3333-333333333333',
                            name: 'Bob Student',
                            studentId: '2026-0002',
                            sectionId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
                            sectionName: 'BSCS 3A',
                            submissionDate: '2026-04-18T09:45:00.000Z',
                            score: null,
                            maxScore: 100,
                            status: 'SUBMITTED',
                            attemptId: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
                        },
                        {
                            id: '11111111-1111-1111-1111-111111111111',
                            name: 'Charlie Student',
                            studentId: '2026-0003',
                            sectionId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
                            sectionName: 'BSCS 3A',
                            submissionDate: null,
                            score: null,
                            maxScore: 100,
                            status: 'NOT_SUBMITTED',
                            attemptId: null,
                        },
                    ],
                },
                {
                    sectionId: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
                    sectionName: 'BSCS 3B',
                    totalStudents: 1,
                    submittedCount: 1,
                    gradedCount: 1,
                    students: [
                        {
                            id: '44444444-4444-4444-4444-444444444444',
                            name: 'Dana Student',
                            studentId: '2026-0004',
                            sectionId: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
                            sectionName: 'BSCS 3B',
                            submissionDate: '2026-04-18T10:00:00.000Z',
                            score: 91,
                            maxScore: 100,
                            status: 'GRADED',
                            attemptId: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
                        },
                    ],
                },
            ],
        });
    });
});
