import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import type { GradingStudent, GradingStudentList, ProctorExam } from '@sentinel/shared/types';
import { useGradingDetail } from './use-grading-detail';
import { getExam, getGradingStudents } from '@sentinel/services';

const { mockApiClient } = vi.hoisted(() => ({
    mockApiClient: vi.fn(),
}));

vi.mock('@sentinel/hooks', () => ({
    useApi: () => mockApiClient,
}));

vi.mock('@sentinel/services', () => ({
    getExam: vi.fn(),
    getGradingStudents: vi.fn(),
}));

function createWrapper() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

    return function Wrapper({ children }: { children: ReactNode }) {
        return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    };
}

describe('useGradingDetail', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('loads the exam and filtered grading students from the live API', async () => {
        const exam = {
            id: '11111111-1111-1111-1111-111111111111',
            title: 'Midterm',
            description: 'Exam description',
            duration: 60,
            passingScore: 60,
            status: 'published',
            subjectId: '33333333-3333-3333-3333-333333333333',
            subject: 'Mathematics',
            section: undefined,
            sectionIds: ['22222222-2222-2222-2222-222222222222'],
            roomId: undefined,
            room: undefined,
            scheduledDate: '2026-04-18T08:00:00.000Z',
            endDateTime: '2026-04-18T09:00:00.000Z',
            publishedAt: '2026-04-17T08:00:00.000Z',
            questionCount: 20,
            createdAt: '2026-04-16T08:00:00.000Z',
            updatedAt: '2026-04-17T08:00:00.000Z',
            settings: {
                shuffleQuestions: false,
                showCorrectAnswers: false,
                allowReview: true,
                randomizeChoices: false,
            },
            configuration: {
                lobbyAdmissionMode: 'AUTOMATIC',
                maxReconnectAttempts: 3,
                strictMode: true,
                screenLock: true,
                cameraRequired: true,
                micRequired: true,
                autoSubmitTimeoutMinutes: 5,
                aiRules: {
                    gaze_tracking: true,
                    face_detection: true,
                    audio_anomaly_detection: true,
                    multiple_faces_detection: true,
                },
                webSecurity: {
                    tab_switching_monitor: true,
                    full_screen_required: true,
                    clipboard_control: true,
                    right_click_disable: true,
                    print_screen_disable: true,
                },
                mobileSecurity: {
                    app_pinning_required: true,
                    prevent_backgrounding: true,
                    notification_block: true,
                    screenshot_block: true,
                    root_jailbreak_detection: true,
                },
            },
            questionSections: [],
            questions: [],
            attemptId: null,
            studentsCount: 0,
        } satisfies ProctorExam;
        const students: GradingStudent[] = [
            {
                id: '44444444-4444-4444-4444-444444444444',
                name: 'Alice Student',
                studentId: '2026-0001',
                sectionId: '22222222-2222-2222-2222-222222222222',
                sectionName: 'BSCS 3A',
                submissionDate: '2026-04-18T08:30:00.000Z',
                score: 18,
                maxScore: 20,
                status: 'GRADED',
                attemptId: '55555555-5555-5555-5555-555555555555',
            },
        ];
        const gradingStudentList: GradingStudentList = {
            students,
            sections: [
                {
                    sectionId: '22222222-2222-2222-2222-222222222222',
                    sectionName: 'BSCS 3A',
                    totalStudents: 1,
                    submittedCount: 1,
                    gradedCount: 1,
                    students,
                },
            ],
        };

        vi.mocked(getExam).mockResolvedValue(exam);
        vi.mocked(getGradingStudents).mockResolvedValue(gradingStudentList);

        const { result } = renderHook(
            () =>
                useGradingDetail(
                    '11111111-1111-1111-1111-111111111111',
                    '22222222-2222-2222-2222-222222222222',
                ),
            {
                wrapper: createWrapper(),
            },
        );

        await waitFor(() => {
            expect(result.current.exam).toEqual(exam);
            expect(result.current.students).toEqual(students);
        });

        expect(getExam).toHaveBeenCalledWith(mockApiClient, '11111111-1111-1111-1111-111111111111');
        expect(getGradingStudents).toHaveBeenCalledWith(
            mockApiClient,
            '11111111-1111-1111-1111-111111111111',
            {
                sectionId: '22222222-2222-2222-2222-222222222222',
                search: undefined,
            },
        );
    });

    it('passes the search term to getGradingStudents when provided', async () => {
        const gradingStudentList: GradingStudentList = { students: [], sections: [] };
        vi.mocked(getExam).mockResolvedValue({} as any);
        vi.mocked(getGradingStudents).mockResolvedValue(gradingStudentList);

        const { result } = renderHook(
            () =>
                useGradingDetail(
                    '11111111-1111-1111-1111-111111111111',
                    undefined,
                    'alice',
                ),
            { wrapper: createWrapper() },
        );

        await waitFor(() => {
            expect(result.current.students).toEqual([]);
        });

        expect(getGradingStudents).toHaveBeenCalledWith(
            mockApiClient,
            '11111111-1111-1111-1111-111111111111',
            { sectionId: undefined, search: 'alice' },
        );
    });
});
