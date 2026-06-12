import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useExamIncidentLogs } from './use-exam-incident-logs';
import { toast } from 'sonner';

const mockRefetch = vi.fn();
const mockFetchNextPage = vi.fn();
const mockReviewIncidents = vi.fn();
const mockPush = vi.fn();

const mockSearchParams = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({
    useParams: () => ({}),
    usePathname: () => '/exams/logs',
    useSearchParams: () => mockSearchParams(),
    useRouter: () => ({
        push: mockPush,
    }),
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock('@sentinel/hooks', () => ({
    useDebounce: (value: any) => value,
    useExamsQuery: () => ({
        data: [{ id: 'exam-1', title: 'Midterm Exam', subject: 'CS 101' }],
        isLoading: false,
    }),
    useExamIncidentsQuery: (examId: string) => ({
        data:
            examId === 'exam-1'
                ? {
                      pages: [
                          {
                              data: [
                                  {
                                      incidentId: 'inc-1',
                                      attemptId: 'attempt-1',
                                      examId: 'exam-1',
                                      studentId: 'student-1',
                                      studentName: 'Juan Dela Cruz',
                                      studentNo: '2024-1001',
                                      incidentType: 'TAB_SWITCH',
                                      severity: 'MEDIUM',
                                      status: 'PENDING',
                                      timestamp: '2026-06-11T22:00:00.000Z',
                                      platform: 'WEB',
                                      source: 'CLIENT',
                                      elapsedSeconds: 120,
                                      evidenceUrl: null,
                                      details: {},
                                  },
                                  {
                                      incidentId: 'inc-3',
                                      attemptId: 'attempt-1',
                                      examId: 'exam-1',
                                      studentId: 'student-1',
                                      studentName: 'Juan Dela Cruz',
                                      studentNo: '2024-1001',
                                      incidentType: 'LOOKING_AWAY',
                                      severity: 'HIGH',
                                      status: 'PENDING',
                                      timestamp: '2026-06-11T22:01:00.000Z',
                                      platform: 'WEB',
                                      source: 'AI',
                                      elapsedSeconds: 180,
                                      evidenceUrl: null,
                                      details: {},
                                  },
                                  {
                                      incidentId: 'inc-2',
                                      attemptId: 'attempt-2',
                                      examId: 'exam-1',
                                      studentId: 'student-2',
                                      studentName: 'Maria Clara',
                                      studentNo: '2024-1002',
                                      incidentType: 'NO_FACE_DETECTED',
                                      severity: 'HIGH',
                                      status: 'CONFIRMED',
                                      timestamp: '2026-06-11T22:05:00.000Z',
                                      platform: 'WEB',
                                      source: 'CLIENT',
                                      elapsedSeconds: 300,
                                      evidenceUrl: null,
                                      details: {},
                                  },
                              ],
                              meta: { total: 3, page: 1, limit: 50, totalPages: 1 },
                          },
                      ],
                  }
                : null,
        isLoading: false,
        isFetching: false,
        isError: false,
        refetch: mockRefetch,
        hasNextPage: false,
        fetchNextPage: mockFetchNextPage,
        isFetchingNextPage: false,
    }),
    useExamReportQuery: (examId: string) => ({
        data:
            examId === 'exam-1'
                ? {
                      students: [{ sectionId: 'sec-1', sectionName: 'BSCS 4A' }],
                  }
                : null,
    }),
    useUpdateExamIncidentsMutation: () => ({
        mutateAsync: mockReviewIncidents,
        isPending: false,
    }),
}));

describe('useExamIncidentLogs Custom Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockSearchParams.mockReturnValue(new URLSearchParams());
    });

    it('returns empty states when no exam is selected', () => {
        const { result } = renderHook(() => useExamIncidentLogs());

        expect(result.current.examId).toBe('');
        expect(result.current.groupMode).toBe('logs');
        expect(result.current.selectedIds).toEqual([]);
        expect(result.current.selectedIncident).toBeNull();
        expect(result.current.drawerOpen).toBe(false);
    });

    it('handles exam selection changes by pushing URL search params', () => {
        const { result } = renderHook(() => useExamIncidentLogs());

        act(() => {
            result.current.handleExamChange('exam-1');
        });

        expect(mockPush).toHaveBeenCalledWith('/exams/logs?examId=exam-1');
    });

    it('returns incident records when exam is selected', () => {
        mockSearchParams.mockReturnValue(new URLSearchParams({ examId: 'exam-1' }));
        const { result } = renderHook(() => useExamIncidentLogs());

        expect(result.current.examId).toBe('exam-1');
        expect(result.current.displayIncidents).toHaveLength(3);
        expect(result.current.displayIncidents[0].studentName).toBe('Juan Dela Cruz');
    });

    it('groups incidents by student when groupMode is toggled to student', () => {
        mockSearchParams.mockReturnValue(new URLSearchParams({ examId: 'exam-1' }));
        const { result } = renderHook(() => useExamIncidentLogs());

        expect(result.current.displayIncidents).toHaveLength(3);

        act(() => {
            result.current.setGroupMode('student');
        });

        // 3 logs merged by student: 2 for Juan Dela Cruz, 1 for Maria Clara
        expect(result.current.displayIncidents).toHaveLength(2);

        const juanMerged = result.current.displayIncidents.find(
            (item) => item.studentName === 'Juan Dela Cruz',
        );
        expect(juanMerged).toBeDefined();
        expect(juanMerged?.details?._incidentCount).toBe(2);
        // Compiled severity is the highest (HIGH)
        expect(juanMerged?.severity).toBe('HIGH');
    });

    it('confirms and dismisses incidents via mutations', async () => {
        mockSearchParams.mockReturnValue(new URLSearchParams({ examId: 'exam-1' }));
        const { result } = renderHook(() => useExamIncidentLogs());

        mockReviewIncidents.mockResolvedValue({});

        await act(async () => {
            await result.current.handleConfirmIncident(['inc-1'], 'confirmed note');
        });

        expect(mockReviewIncidents).toHaveBeenCalledWith({
            incidentIds: ['inc-1'],
            status: 'CONFIRMED',
            reviewNotes: 'confirmed note',
        });
        expect(toast.success).toHaveBeenCalledWith('Incident confirmed successfully');
    });
});
