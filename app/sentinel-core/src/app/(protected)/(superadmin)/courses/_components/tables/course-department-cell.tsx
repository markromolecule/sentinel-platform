"use client";
import { useDepartmentsQuery } from "@sentinel/hooks";


export type CourseDepartmentCellProps = {
    departmentId: string;
    departmentName?: string | null;
    departmentCode?: string | null;
};

export function CourseDepartmentCell({ departmentId, departmentName, departmentCode }: CourseDepartmentCellProps) {
    const {
        data: departments = [],
        isLoading,
    } = useDepartmentsQuery();

    // If departmentName or departmentCode is provided from the backend join, use it directly
    if (departmentCode) {
        return (
            <div>{departmentCode}</div>
        );
    }

    if (departmentName) {
        return (
            <div>{departmentName}</div>
        );
    }

    // find department by id (fallback for manual sync or if props missing)
    const department = departments.find((d) => d.id === departmentId);

    return (
        <div>
            {department ? department.code : (isLoading ? "..." : departmentId)}
        </div>
    );
}
