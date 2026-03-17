"use client";

import { useStudentsList } from "@/app/(protected)/(proctor)/students/_hooks/use-students-list";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@sentinel/ui";
import { UserPlus } from "lucide-react";
import { Separator } from "@sentinel/ui";
import { StudentEnrollmentDialog } from "@/app/(protected)/(proctor)/students/_components/student-enrollment-dialog";
import { StudentsTable } from "@/app/(protected)/(proctor)/students/_components/students-table";
import { StudentsEmptyState } from "@/app/(protected)/(proctor)/students/_components/students-empty-state";

export default function ProctorStudentsPage() {
    const { students, isEnrollmentOpen, setIsEnrollmentOpen } = useStudentsList();

    return (
        <div className="flex flex-col gap-6 md:p-6 p-4">
            <PageHeader
                title="Students"
                description="Manage and enroll students for your exams."
            >
                <Button
                    onClick={() => setIsEnrollmentOpen(true)}
                    className="bg-[#323d8f] hover:bg-[#323d8f]/90 text-white"
                >
                    <UserPlus className="w-4 h-4 mr-2" />
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
                onOpenChange={setIsEnrollmentOpen}
            />
        </div>
    );
}

