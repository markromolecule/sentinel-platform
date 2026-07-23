'use client';

import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useStudentExamData } from './use-student-exam-data';

const { mockUseExamQuery, mockUseExamConfigurationQuery } = vi.hoisted(() => ({
    mockUseExamQuery: vi.fn(),
    mockUseExamConfigurationQuery: vi.fn(),
}));

vi.mock('next/navigation', () => ({
    useParams: () => ({
        id: 'exam-1',
    }),
}));

vi.mock('@sentinel/hooks', () => ({
    useExamQuery: (examId: string) => mockUseExamQuery(examId),
    useExamConfigurationQuery: (examId: string) => mockUseExamConfigurationQuery(examId),
}));

describe('useStudentExamData', () => {
    it('exposes a locked blocked state from runtime access', () => {
        mockUseExamQuery.mockReturnValue({
            data: {
                runtimeAccess: {
                    state: 'locked',
                    reasonCode: 'LOCKED',
                    message: 'This exam attempt is locked right now.',
                    canStart: false,
                    canResume: false,
                    hasActiveAttempt: true,
                    startsAt: null,
                    endsAt: null,
                    reopenedUntil: null,
                },
            },
            isLoading: false,
            refetch: vi.fn(),
        });
        mockUseExamConfigurationQuery.mockReturnValue({
            data: null,
            isLoading: false,
        });

        const { result } = renderHook(() => useStudentExamData());

        expect(result.current.blockedState).toEqual({
            isBlocked: true,
            code: 'LOCKED',
            title: 'Exam Locked',
            message: 'This exam attempt is locked right now.',
        });
    });

    it('exposes a closed blocked state from runtime access', () => {
        mockUseExamQuery.mockReturnValue({
            data: {
                runtimeAccess: {
                    state: 'closed',
                    reasonCode: 'CLOSED',
                    message: 'This exam has been closed.',
                    canStart: false,
                    canResume: false,
                    hasActiveAttempt: false,
                    startsAt: null,
                    endsAt: null,
                    reopenedUntil: null,
                },
            },
            isLoading: false,
            refetch: vi.fn(),
        });
        mockUseExamConfigurationQuery.mockReturnValue({
            data: null,
            isLoading: false,
        });

        const { result } = renderHook(() => useStudentExamData());

        expect(result.current.blockedState).toEqual({
            isBlocked: true,
            code: 'CLOSED',
            title: 'Exam Closed',
            message: 'This exam has been closed.',
        });
    });

    it('exposes configQueryError when configuration query fails and no embedded config exists', () => {
        mockUseExamQuery.mockReturnValue({
            data: {
                configuration: null,
            },
            isLoading: false,
            isError: false,
            refetch: vi.fn(),
        });
        mockUseExamConfigurationQuery.mockReturnValue({
            data: null,
            isLoading: false,
            isError: true,
        });

        const { result } = renderHook(() => useStudentExamData());

        expect(result.current.configQueryError).toBe(true);
    });

    it('does not block the flow on the configuration request when exam data includes configuration', () => {
        mockUseExamQuery.mockReturnValue({
            data: {
                configuration: {
                    lobbyAdmissionMode: 'AUTOMATIC',
                    maxReconnectAttempts: 3,
                },
            },
            isLoading: false,
            isError: false,
            refetch: vi.fn(),
        });
        mockUseExamConfigurationQuery.mockReturnValue({
            data: null,
            isLoading: true,
            isError: false,
        });

        const { result } = renderHook(() => useStudentExamData());

        expect(result.current.isLoading).toBe(false);
    });
});
