"use client";

import { useDepartmentsQuery } from "@/hooks/query/departments/use-departments-query";

export type CourseDepartmentCellProps = {
    departmentId: string;
};

export function CourseDepartmentCell({ departmentId }: CourseDepartmentCellProps) {
    const {
        data: departments = [
            {
                id: "",
                code: "",
            },
        ],
    } = useDepartmentsQuery();

    // find department by id
    const department = departments.find((d) => d.id === departmentId);

    return (
        <div>
            {/* if department is not found, return departmentId */}
            {department ? department.code : departmentId}
        </div>
    );
}
