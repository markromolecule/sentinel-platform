'use client';

import { useStudentsList } from '@/app/(protected)/(instructor)/students/_hooks/use-students-list';
import { PageHeader, Button, Separator } from '@sentinel/ui';
import { UserPlus } from 'lucide-react';
import { StudentEnrollmentDialog } from '@/app/(protected)/(instructor)/students/_components/dialogs/student-enrollment-dialog';
import { StudentsTable } from '@/app/(protected)/(instructor)/students/_components/tables/students-table';
import { StudentsEmptyState } from '@/app/(protected)/(instructor)/students/_components/views/students-empty-state';

export default function ProctorStudentsPage() {
    const { students, isEnrollmentOpen, setIsEnrollmentOpen } = useStudentsList();

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <PageHeader title="Students" description="Manage and enroll students for your exams.">
                <Button
                    onClick={() => setIsEnrollmentOpen(true)}
                    className="bg-[#323d8f] text-white hover:bg-[#323d8f]/90"
                >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Students
                </Button>
            </PageHeader>

            <Separator />

            {/* Students Table */}
            {students.length > 0 ? (
                <StudentsTable students={students} />
            ) : (
                /* Empty State */
                <StudentsEmptyState
                    isSearching={false}
                    onAddClick={() => setIsEnrollmentOpen(true)}
                />
            )}

            {/* Enrollment Dialog */}
            <StudentEnrollmentDialog
                open={isEnrollmentOpen}
                onOpenChangeAction={setIsEnrollmentOpen}
            />
        </div>
    );
}
