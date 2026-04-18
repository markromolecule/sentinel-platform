import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import type { GradingExam } from '@sentinel/shared/types';
import { useGradingList } from './use-grading-list';
import { getGradingExams } from '@sentinel/services';

const { mockApiClient } = vi.hoisted(() => ({
    mockApiClient: vi.fn(),
}));

vi.mock('@sentinel/hooks', () => ({
    useApi: () => mockApiClient,
}));

vi.mock('@sentinel/services', () => ({
    getGradingExams: vi.fn(),
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

describe('useGradingList', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('requests live grading exams with the active section filter', async () => {
        const exams: GradingExam[] = [
            {
                id: '11111111-1111-1111-1111-111111111111',
                title: 'Midterm',
                subject: 'Mathematics',
                scheduledDate: '2026-04-18T08:00:00.000Z',
                totalStudents: 30,
                submittedCount: 12,
                gradedCount: 8,
                status: 'IN_PROGRESS',
                sectionIds: ['22222222-2222-2222-2222-222222222222'],
                sectionNames: ['BSCS 3A'],
            },
        ];

        vi.mocked(getGradingExams).mockResolvedValue(exams);

        const { result } = renderHook(() => useGradingList('22222222-2222-2222-2222-222222222222'), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.exams).toEqual(exams);
        });

        expect(getGradingExams).toHaveBeenCalledWith(mockApiClient, {
            sectionId: '22222222-2222-2222-2222-222222222222',
        });
    });
});
