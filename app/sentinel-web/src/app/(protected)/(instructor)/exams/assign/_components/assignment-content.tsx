'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useApi } from '@sentinel/hooks';
import { listExamAssignments, type ApiExamAssignment } from '@sentinel/services';
import { PageHeader, Separator } from '@sentinel/ui';
import { ProctorAssignmentTable, type InstructorAssignmentRow } from './assignment-table';

function formatScheduledDate(value: string | null) {
    if (!value) {
        return null;
    }

    return new Date(value).toLocaleDateString();
}

function mapAssignmentRow(assignment: ApiExamAssignment): InstructorAssignmentRow {
    return {
        id: assignment.id,
        title: assignment.exam.title,
        subject: assignment.exam.subjectTitle ?? 'No subject',
        scheduledDate: formatScheduledDate(assignment.scheduledAt ?? assignment.exam.scheduledDate),
        assignedInstructor: assignment.assignee.name,
        status: assignment.status,
        relationship: assignment.relationship,
    };
}

export function InstructorAssignmentContent() {
    const apiClient = useApi();
    const { data, isLoading, error } = useQuery({
        queryKey: ['exam-assignments', 'instructor'],
        queryFn: () => listExamAssignments(apiClient),
    });

    const assignmentRows = useMemo(
        () => (data ?? []).map(mapAssignmentRow),
        [data],
    );

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <PageHeader
                title="Instructor Assignment"
                description="Review inbound and outbound instructor assignments for examinations."
            />

            <Separator />

            {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error.message || 'Unable to load instructor assignments.'}
                </div>
            ) : (
                <ProctorAssignmentTable data={assignmentRows} isLoading={isLoading} />
            )}
        </div>
    );
}
