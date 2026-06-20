import { describe, expect, it, vi } from 'vitest';
import { getInstructorDashboardRouteHandler } from './get-instructor-dashboard.controller';
import { UserService } from '../user.service';

describe('getInstructorDashboardRouteHandler', () => {
    it('returns 403 Forbidden for non-instructor users', async () => {
        const json = vi.fn();
        const c = {
            get: vi.fn((key: string) => {
                if (key === 'supabaseUser') {
                    return { user_metadata: { role: 'student' } };
                }
                return undefined;
            }),
            json,
        };

        const result = await getInstructorDashboardRouteHandler(c as any);

        expect(json).toHaveBeenCalledWith({ error: 'Forbidden. Insufficient permissions.' }, 403);
    });

    it('returns 200 and calls getInstructorDashboard for instructor users', async () => {
        const mockDashboardData = {
            stats: {
                totalStudents: 10,
                totalClassrooms: 2,
                totalSubjects: 3,
                examsCreated: 5,
            },
            recentExams: [
                {
                    exam_id: '88888888-8888-4888-8888-888888888888',
                    title: 'Midterm Exam',
                    status: 'PUBLISHED',
                    scheduled_date: '2026-06-20T12:00:00.000Z',
                    duration_minutes: 60,
                    question_count: 50,
                    subject_title: 'Mathematics',
                    subject_code: 'MATH101',
                    attempts_count: 8,
                    incidents_count: 0,
                },
            ],
        };

        const getInstructorDashboardSpy = vi
            .spyOn(UserService, 'getInstructorDashboard')
            .mockResolvedValue(mockDashboardData);

        const json = vi.fn().mockReturnValue({ ok: true });
        const c = {
            get: vi.fn((key: string) => {
                if (key === 'supabaseUser') {
                    return { user_metadata: { role: 'instructor' } };
                }
                if (key === 'institutionId') {
                    return '11111111-1111-4111-8111-111111111111';
                }
                if (key === 'user') {
                    return {
                        user_profiles: {
                            user_id: '22222222-2222-4222-8222-222222222222',
                        },
                    };
                }
                if (key === 'dbClient') {
                    return {};
                }
                return undefined;
            }),
            json,
        };

        await getInstructorDashboardRouteHandler(c as any);

        expect(getInstructorDashboardSpy).toHaveBeenCalledTimes(1);
        expect(getInstructorDashboardSpy).toHaveBeenCalledWith(
            expect.any(Object),
            '22222222-2222-4222-8222-222222222222',
            '11111111-1111-4111-8111-111111111111',
        );
        expect(json).toHaveBeenCalledWith(
            {
                message: 'Instructor dashboard metrics fetched successfully',
                data: mockDashboardData,
            },
            200,
        );
    });
});
