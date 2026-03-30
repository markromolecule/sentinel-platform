import { useCoursesQuery, useDepartmentsQuery } from "@sentinel/hooks";
import { type Subject } from "@sentinel/shared/types";
import { type ColumnDef } from "@tanstack/react-table";
import { columns as defaultColumns } from "@/app/(protected)/(instructor)/subjects/_components/tables/columns";
import { SubjectsTable } from "@/app/(protected)/(instructor)/subjects/_components/tables/subjects-table";

type SubjectsListProps = {
    subjects: Subject[];
    columns?: () => ColumnDef<Subject>[];
    searchTerm?: string;
    onSearchChange?: (value: string) => void;
};

export function SubjectsList({
    subjects,
    columns = defaultColumns,
    searchTerm,
    onSearchChange
}: SubjectsListProps) {
    const { data: departments = [] } = useDepartmentsQuery();
    const { data: courses = [] } = useCoursesQuery();

    const facets = [
        {
            columnKey: "department_code",
            title: "Dept",
            options: departments
                .filter(dept => !!dept.code)
                .map((dept) => ({
                    label: dept.code!,
                    value: dept.code!,
                })),
        },
        {
            columnKey: "course_code",
            title: "Course",
            options: courses
                .filter(course => !!course.code)
                .map((course) => ({
                    label: course.code!,
                    value: course.code!,
                })),
        },
    ];

    return (
        <SubjectsTable
            columns={columns}
            data={subjects}
            searchValue={searchTerm}
            onSearchChange={onSearchChange}
            facets={facets}
        />
    );
}
