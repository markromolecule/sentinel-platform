"use client";

import {
    useEnrollmentRequestsQuery,
    useDepartmentsQuery,
    useCoursesQuery,
    useSectionsQuery
} from "@sentinel/hooks";
import { PageHeader, Separator, DataTable } from "@sentinel/ui";
import { requestColumns } from "@/app/(protected)/(admin)/subjects/requests/_components/columns";

export default function EnrollmentRequestsPage() {
    const { data: requests = [], isLoading, isError } = useEnrollmentRequestsQuery();
    const { data: departments = [] } = useDepartmentsQuery();
    const { data: courses = [] } = useCoursesQuery();
    const { data: sections = [] } = useSectionsQuery();

    const facets = [
        {
            columnKey: "status",
            title: "Status",
            options: [
                { label: "Pending", value: "PENDING" },
                { label: "Approved", value: "APPROVED" },
                { label: "Rejected", value: "REJECTED" },
            ],
        },
        {
            columnKey: "department_id",
            title: "Department",
            options: departments.map((d) => ({
                label: d.name,
                value: d.id,
            })),
        },
        {
            columnKey: "course_id",
            title: "Course",
            options: courses.map((c) => ({
                label: c.title,
                value: c.id,
            })),
        },
        {
            columnKey: "section_id",
            title: "Section",
            options: sections.map((s) => ({
                label: s.name,
                value: s.id,
            })),
        },
    ];

    return (
        <div className="flex flex-col gap-6 md:p-6 p-4">
            <PageHeader
                title="Enrollment Requests"
                description="Review and process instructor offered-subject enrollment requests."
            />
            <Separator />

            <div className="relative">
                {isLoading ? (
                    <div className="flex h-32 items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    </div>
                ) : isError ? (
                    <div className="mt-4 flex h-32 items-center justify-center text-destructive bg-destructive/5 rounded-md border border-destructive/20">
                        Error loading enrollment requests.
                    </div>
                ) : (
                    <DataTable
                        columns={requestColumns}
                        data={requests}
                        searchKey="instructor_name"
                        searchPlaceholder="Search by instructor..."
                        facets={facets}
                        initialColumnVisibility={{
                            department_id: false,
                            course_id: false,
                            section_id: false,
                        }}
                    />
                )}
            </div>
        </div>
    );
}
