import { fireEvent, render, screen } from '@testing-library/react';
import { buildEnrollmentRequestFormValues, type SubjectOffering } from '@sentinel/shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RequestOfferedSubjectBuilderDialog } from './request-offered-subject-builder-dialog';

class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
}

window.HTMLElement.prototype.scrollIntoView = () => undefined;

const {
    mockUseSubjectOfferingsQuery,
    mockUseDebounce,
    mockUseEnrollSubjectMutation,
    mockUseUpdateEnrollmentRequestMutation,
} = vi.hoisted(() => ({
    mockUseSubjectOfferingsQuery: vi.fn(),
    mockUseDebounce: vi.fn(),
    mockUseEnrollSubjectMutation: vi.fn(),
    mockUseUpdateEnrollmentRequestMutation: vi.fn(),
}));

vi.mock('@sentinel/hooks', () => ({
    useSubjectOfferingsQuery: mockUseSubjectOfferingsQuery,
    useDebounce: mockUseDebounce,
    useEnrollSubjectMutation: mockUseEnrollSubjectMutation,
    useUpdateEnrollmentRequestMutation: mockUseUpdateEnrollmentRequestMutation,
    useStableValue: (factory: () => unknown) => factory(),
    useStableIdMap: <T extends { id: string }>(items: T[], getLabel: (item: T) => string) =>
        new Map(items.map((item) => [item.id, getLabel(item)])),
}));

const offering: SubjectOffering = {
    id: 'offering-1',
    subjectId: 'subject-1',
    subjectCode: 'CS101',
    subjectTitle: 'Programming 1',
    termId: 'term-1',
    termAcademicYear: '2026-2027',
    termSemester: 'FIRST',
    status: 'OPEN',
    departmentIds: ['dept-1'],
    courseIds: ['course-1'],
    sectionIds: ['section-1'],
    yearLevels: [2],
    departments: [
        {
            id: 'dept-1',
            name: 'College of Computing',
            code: 'CCS',
        },
    ],
    courses: [
        {
            id: 'course-1',
            title: 'Bachelor of Science in Computer Science',
            code: 'BSCS',
        },
    ],
    sections: [
        {
            id: 'section-1',
            name: 'CS-2A',
            departmentId: 'dept-1',
            courseId: 'course-1',
            yearLevel: 2,
        },
    ],
};

describe('RequestOfferedSubjectBuilderDialog', () => {
    globalThis.ResizeObserver = ResizeObserverMock as typeof ResizeObserver;

    const updateMutate = vi.fn();

    beforeEach(() => {
        updateMutate.mockReset();
        mockUseDebounce.mockImplementation((value: string) => value);
        mockUseSubjectOfferingsQuery.mockReturnValue({
            data: [offering],
            isLoading: false,
        });
        mockUseEnrollSubjectMutation.mockReturnValue({
            mutate: vi.fn(),
            isPending: false,
        });
        mockUseUpdateEnrollmentRequestMutation.mockReturnValue({
            mutate: updateMutate,
            isPending: false,
        });
    });

    it('hydrates existing request targets in edit mode and submits the update payload', () => {
        render(
            <RequestOfferedSubjectBuilderDialog
                intent="edit"
                mode="pick-offering"
                open
                onOpenChange={() => undefined}
                requestIds={['request-1']}
                initialValues={buildEnrollmentRequestFormValues({
                    subjectOfferingId: offering.id,
                    departmentIds: ['dept-1'],
                    courseIds: ['course-1'],
                    yearLevels: [2],
                    sectionIds: ['section-1'],
                })}
            />,
        );

        expect(screen.getByText(/edit enrollment request/i)).toBeTruthy();
        expect(screen.getByRole('button', { name: /save request changes/i })).toBeTruthy();
        expect(screen.getByLabelText('CCS').getAttribute('data-state')).toBe('checked');
        expect(screen.getByLabelText('BSCS').getAttribute('data-state')).toBe('checked');
        expect(screen.getByLabelText('Year 2').getAttribute('data-state')).toBe('checked');
        expect(screen.getByLabelText('CS-2A').getAttribute('data-state')).toBe('checked');

        expect(updateMutate).not.toHaveBeenCalled();
    });
});
