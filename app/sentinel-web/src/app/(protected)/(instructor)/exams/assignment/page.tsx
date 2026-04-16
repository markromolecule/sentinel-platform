'use client';

import { Separator } from '@sentinel/ui';
import { Button } from '@sentinel/ui';
import { UserCheck } from 'lucide-react';
import { MOCK_PROCTOR_EXAMS, MOCK_PROCTOR } from '@sentinel/shared/constants';
import { ProctorAssignmentTable } from '@/app/(protected)/(instructor)/exams/assignment/_components/assignment-table';

export default function ProctorAssignmentPage() {
    // Enhanced mock data to include instructor assignment info
    // In a real app, this would come from the backend joining Exam and Assignment tables
    const assignedExams = MOCK_PROCTOR_EXAMS.map((exam) => ({
        ...exam,
        assignedInstructor: exam.id === '2' ? 'John Doe' : MOCK_PROCTOR.name, // Mock assignments
        assignedInstructorId: exam.id === '2' ? '2' : MOCK_PROCTOR.id,
    }));
    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Instructor Assignment</h1>
                    <p className="text-muted-foreground">
                        Manage instructor assignments for examinations.
                    </p>
                </div>
                <Button className="bg-[#323d8f] text-white hover:bg-[#323d8f]/90">
                    <UserCheck className="mr-2 h-4 w-4" />
                    Assign Instructor
                </Button>
            </div>

            <Separator />

            <ProctorAssignmentTable data={assignedExams} />
        </div>
    );
}
