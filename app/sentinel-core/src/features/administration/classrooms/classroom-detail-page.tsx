'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useClassroomQuery, useStableValue, isPermissionDeniedError } from '@sentinel/hooks';
import { Button, DataTableColumnHeader, PageHeader, Separator, PermissionDeniedState } from '@sentinel/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { ArrowLeft, Users, UserPlus } from 'lucide-react';
import { type ClassroomStudent } from '@sentinel/shared/types';
import { ClassroomInstructorsDialog } from './_components/classroom-instructors-dialog';
import { ClassroomRosterSection } from './_components/classroom-roster-section';
import { ClassroomStudentEnrollmentDialog } from './_components/classroom-student-enrollment-dialog';
import { ClassroomStudentActionCell } from './_components/classroom-student-action-cell';
import { PermissionGate } from '@/features/administration/shared/permission-gate';

function buildStudentColumns(classroomId: string): ColumnDef<ClassroomStudent>[] {
    return [
        {
            accessorKey: 'studentNumber',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Student No." />,
        },
        {
            accessorKey: 'fullName',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
            cell: ({ row }) => row.original.fullName || 'Unnamed student',
        },
        {
            id: 'course',
            accessorFn: (row) => [row.courseCode, row.courseTitle].filter(Boolean).join(' - '),
            header: ({ column }) => <DataTableColumnHeader column={column} title="Course" />,
            cell: ({ row }) =>
                [row.original.courseCode, row.original.courseTitle].filter(Boolean).join(' - ') ||
                'No course',
        },
        {
            id: 'department',
            accessorFn: (row) => row.departmentCode || row.departmentName || '',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Department" />,
            cell: ({ row }) =>
                row.original.departmentCode || row.original.departmentName || 'No department',
        },
        {
            accessorKey: 'enrolledAt',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Enrolled" />,
            cell: ({ row }) =>
                row.original.enrolledAt
                    ? new Date(row.original.enrolledAt).toLocaleDateString()
                    : 'Unknown',
        },
        {
            id: 'actions',
            header: () => <span className="sr-only">Actions</span>,
            cell: ({ row }) => (
                <ClassroomStudentActionCell classroomId={classroomId} student={row.original} />
            ),
        },
    ];
}

export function ClassroomDetailPage() {
    const params = useParams<{ id: string }>();
    const classroomId = Array.isArray(params?.id) ? params.id[0] : params?.id;
    const [searchTerm, setSearchTerm] = useState('');
    const [isEnrollmentOpen, setIsEnrollmentOpen] = useState(false);
    const [isInstructorsOpen, setIsInstructorsOpen] = useState(false);
    const { data: classroom, isLoading, error } = useClassroomQuery(classroomId);

    const isClassroomViewDenied = isPermissionDeniedError(error, 'classrooms:view');

    const filteredStudents = useStableValue(
        () =>
            (classroom?.students ?? []).filter((student) =>
                [
                    student.fullName,
                    student.studentNumber,
                    student.courseCode,
                    student.courseTitle,
                    student.departmentCode,
                    student.departmentName,
                ]
                    .filter(Boolean)
                    .some((value) =>
                        value?.toLowerCase().includes(searchTerm.trim().toLowerCase()),
                    ),
            ),
        [classroom?.students, searchTerm],
    );

    const studentColumns = useStableValue(
        () => buildStudentColumns(classroomId ?? ''),
        [classroomId],
    );

    if (!classroomId) {
        return (
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <PageHeader title="Classroom" description="The classroom ID is missing." />
            </div>
        );
    }

    if (isClassroomViewDenied) {
        return (
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <PageHeader title="Classroom" description="Unable to load classroom details." />
                <Separator />
                <PermissionDeniedState resourceName="classrooms" className="h-[360px]" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <PageHeader title="Classroom" description="Unable to load classroom details." />
                <Separator />
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error.message}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <PageHeader
                title={classroom?.className || (isLoading ? 'Loading classroom...' : 'Classroom')}
                description={
                    classroom
                        ? `${classroom.scopeSummary.subjectLabel} • ${classroom.scopeSummary.sectionLabel}`
                        : 'View classroom scope and manage enrolled students.'
                }
            >
                <Button asChild variant="outline">
                    <Link href="/classrooms">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Link>
                </Button>
                <Button
                    variant="outline"
                    onClick={() => setIsInstructorsOpen(true)}
                    disabled={!classroom}
                    className="border-[#323d8f] text-[#323d8f] hover:bg-[#323d8f]/5"
                >
                    <Users className="mr-2 h-4 w-4" />
                    Instructors
                </Button>
                <PermissionGate permission="classrooms" action="edit">
                    <Button
                        onClick={() => setIsEnrollmentOpen(true)}
                        disabled={!classroom}
                        className="bg-[#323d8f] text-white hover:bg-[#323d8f]/90"
                    >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Students
                    </Button>
                </PermissionGate>
            </PageHeader>
            <Separator />

            <ClassroomRosterSection
                columns={studentColumns}
                students={filteredStudents}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                isLoading={isLoading}
            />

            {classroom ? (
                <>
                    <ClassroomInstructorsDialog
                        open={isInstructorsOpen}
                        onOpenChange={setIsInstructorsOpen}
                        classroom={classroom}
                    />
                    <ClassroomStudentEnrollmentDialog
                        open={isEnrollmentOpen}
                        onOpenChangeAction={setIsEnrollmentOpen}
                        classroomId={classroom.id}
                        classroomName={classroom.className || classroom.scopeSummary.sectionLabel}
                        subjectLabel={classroom.scopeSummary.subjectLabel}
                        sectionLabel={classroom.scopeSummary.sectionLabel}
                    />
                </>
            ) : null}
        </div>
    );
}
