import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ProctorExam } from '@sentinel/shared/types';
import { useExamCard } from './index';

vi.mock('@sentinel/hooks', () => ({
    useAuth: () => ({
        user: { id: 'user-1' },
    }),
    useActivePermissions: () => ({
        hasPermission: vi.fn().mockReturnValue(false),
    }),
    useDeleteExamMutation: () => ({
        mutate: vi.fn(),
    }),
    useUpdateExamStatusMutation: () => ({
        mutate: vi.fn(),
        isPending: false,
    }),
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

const baseExam: ProctorExam = {
    id: '11111111-1111-4111-8111-111111111111',
    title: 'Algorithms Final',
    description: '',
    duration: 90,
    passingScore: 75,
    status: 'published',
    questions: [],
    questionSections: [],
    createdAt: '2026-04-22T00:00:00.000Z',
    updatedAt: '2026-04-22T00:00:00.000Z',
    subject: 'Data Structures',
    questionCount: 0,
    studentsCount: 0,
    createdBy: 'user-1',
    assignedInstructorIds: [],
};

describe('useExamCard', () => {
    it('adds a PDF export action without replacing the existing published exam actions', () => {
        const { result } = renderHook(() => useExamCard({ exam: baseExam }));

        expect(result.current.primaryActions.map((action) => action.label)).toEqual([
            'Unpublish',
            'Export PDF',
            'Monitor',
        ]);
        expect(result.current.primaryActions[1]).toMatchObject({
            href: `/exams/${baseExam.id}/export`,
            variant: 'outline',
        });
    });

    it('keeps the draft builder and publish actions while adding PDF export', () => {
        const { result } = renderHook(() =>
            useExamCard({
                exam: {
                    ...baseExam,
                    status: 'draft',
                },
            }),
        );

        expect(result.current.primaryActions.map((action) => action.label)).toEqual([
            'Builder',
            'Export PDF',
            'Publish',
        ]);
    });

    it('hides management actions for instructors who are neither the creator nor assigned', () => {
        const { result } = renderHook(() =>
            useExamCard({
                exam: {
                    ...baseExam,
                    createdBy: 'other-user',
                    assignedInstructorIds: [],
                    status: 'draft',
                },
            }),
        );

        expect(result.current.canManageExam).toBe(false);
        expect(result.current.primaryActions.map((action) => action.label)).toEqual(['Export PDF']);
    });
});
