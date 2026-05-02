'use client';

import Link from 'next/link';
import { useStudentsList } from '@/app/(protected)/(instructor)/students/_hooks/use-students-list';
import { PageHeader, Button, Separator } from '@sentinel/ui';
import { School } from 'lucide-react';
import { StudentsTable } from '@/app/(protected)/(instructor)/students/_components/tables/students-table';
import { StudentsEmptyState } from '@/app/(protected)/(instructor)/students/_components/views/students-empty-state';

export default function ProctorStudentsPage() {
    const { students, setIsEnrollmentOpen } = useStudentsList();

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <PageHeader
                title="Students"
                description="Review enrolled students and use the view action to inspect their current instructor-scoped subjects and classrooms."
            >
                <Button asChild>
                    <Link href="/classrooms">
                        <School className="text-primary-foreground mr-2 h-4 w-4" />
                        Open Classrooms
                    </Link>
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
        </div>
    );
}
