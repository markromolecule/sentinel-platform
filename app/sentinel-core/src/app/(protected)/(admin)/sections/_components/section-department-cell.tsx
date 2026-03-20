"use client";

import { useDepartmentsQuery } from "@/hooks/query/departments/use-departments-query";

interface SectionDepartmentCellProps {
    departmentId: string;
}

export const SectionDepartmentCell = ({ departmentId }: SectionDepartmentCellProps) => {
    const { data: departments = [] } = useDepartmentsQuery();
    const department = departments.find((c) => c.id === departmentId);

    return (
        <div className="font-medium">
            {department?.name || "Unknown Department"}
        </div>
    );
};
