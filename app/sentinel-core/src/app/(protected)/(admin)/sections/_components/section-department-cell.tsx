"use client";
import { useDepartmentsQuery } from "@sentinel/hooks";


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
