"use client";

import { DataTable } from "@sentinel/ui";
import { type EnrollmentRequest } from "@sentinel/shared/types";
import { requestColumns } from "@/app/(protected)/(admin)/subjects/requests/_components/columns";
import { buildEnrollmentRequestFacets } from "@/app/(protected)/(admin)/subjects/requests/_components/enrollment-request-facets";
import { EnrollmentRequestsEmptyState } from "@/app/(protected)/(admin)/subjects/requests/_components/enrollment-requests-empty-state";

type EnrollmentRequestsListProps = {
    requests: EnrollmentRequest[];
    departments: Array<{ id: string; name: string }>;
    courses: Array<{ id: string; title: string }>;
    sections: Array<{ id: string; name: string }>;
    isLoading?: boolean;
};

export function EnrollmentRequestsList({
    requests,
    departments,
    courses,
    sections,
    isLoading = false,
}: EnrollmentRequestsListProps) {
    return (
        <DataTable
            columns={requestColumns}
            data={requests}
            searchKey="instructor_name"
            searchPlaceholder="Search by instructor..."
            facets={buildEnrollmentRequestFacets({ departments, courses, sections })}
            initialColumnVisibility={{
                department_id: false,
                course_id: false,
                section_id: false,
            }}
            isLoading={isLoading}
            emptyContent={<EnrollmentRequestsEmptyState />}
        />
    );
}
