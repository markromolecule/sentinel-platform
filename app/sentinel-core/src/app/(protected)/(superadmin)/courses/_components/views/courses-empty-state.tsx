"use client";

import { EmptyState } from "@sentinel/ui";
import { AddCourseDialog } from "@/app/(protected)/(superadmin)/courses/_components/dialogs/add-course-dialog";

interface CoursesEmptyStateProps {
    searchTerm?: string;
}

export function CoursesEmptyState({ searchTerm }: CoursesEmptyStateProps) {
    return (
        <EmptyState
            icon="📚"
            title={searchTerm ? "No results found" : "No courses added"}
            description={
                searchTerm
                    ? `We couldn't find any courses matching "${searchTerm}".`
                    : "Add courses to the system to start managing academic programs."
            }
            action={!searchTerm && <AddCourseDialog />}
        />
    );
}
