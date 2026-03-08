import { useWatch } from 'react-hook-form';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@sentinel/ui';
import { Input } from '@sentinel/ui';
import { useCoursesQuery } from '@/hooks/query/courses/use-courses-query';
import { useDepartmentsQuery } from '@/hooks/query/departments/use-departments-query';
import { type SubjectFormFieldsProps } from '@/app/(protected)/admin/subjects/_components/subject-form-fields/_types';
import { FilterableCheckboxGroup } from '@/app/(protected)/admin/subjects/_components/filterable-checkbox-group';
import { AllocatedSectionsPicker } from '@/app/(protected)/admin/subjects/_components/allocated-sections-picker';

const YEAR_LEVEL_OPTIONS = [1, 2, 3, 4, 5];

export function SubjectFormFields({ form }: SubjectFormFieldsProps) {
    const { data: departments = [] } = useDepartmentsQuery();
    const { data: courses = [] } = useCoursesQuery();

    const selectedDepartmentIds = useWatch({
        control: form.control,
        name: 'department_ids',
    });
    const selectedCourseIds = useWatch({
        control: form.control,
        name: 'course_ids',
    });
    const selectedYearLevels = useWatch({
        control: form.control,
        name: 'year_levels',
    });

    const filteredCourses =
        selectedDepartmentIds?.length
            ? courses.filter(
                (course) => course.department && selectedDepartmentIds.includes(course.department),
            )
            : courses;

    function toggleStringValue(field: 'department_ids' | 'course_ids', value: string) {
        const current = form.getValues(field) ?? [];
        const next = current.includes(value)
            ? current.filter((entry) => entry !== value)
            : [...current, value];

        form.setValue(field, next, {
            shouldDirty: true,
            shouldValidate: true,
        });
    }

    function toggleYearLevel(value: number) {
        const current = form.getValues('year_levels') ?? [];
        const next = current.includes(value)
            ? current.filter((entry) => entry !== value)
            : [...current, value];

        form.setValue('year_levels', next, {
            shouldDirty: true,
            shouldValidate: true,
        });
    }

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2">
                <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Subject Code</FormLabel>
                            <FormControl>
                                <Input placeholder="Subject Code (e.g., CS101)" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Subject Title</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Subject Title (e.g., Introduction to Computer Science)"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <FilterableCheckboxGroup
                    title="Departments"
                    searchPlaceholder="Filter departments..."
                    emptyMessage="No departments match your search."
                    options={departments.map((department) => ({
                        value: department.id,
                        label: department.code || department.name,
                    }))}
                    selectedValues={selectedDepartmentIds ?? []}
                    onToggle={(value) => toggleStringValue('department_ids', value)}
                    visibleRows={3}
                />

                <FilterableCheckboxGroup
                    title="Year Levels"
                    searchPlaceholder="Filter year levels..."
                    emptyMessage="No year levels match your search."
                    options={YEAR_LEVEL_OPTIONS.map((level) => ({
                        value: String(level),
                        label: `Year ${level}`,
                    }))}
                    selectedValues={(selectedYearLevels ?? []).map(String)}
                    onToggle={(value) => toggleYearLevel(Number(value))}
                    visibleRows={3}
                />

                <FilterableCheckboxGroup
                    title="Courses"
                    searchPlaceholder="Filter courses..."
                    emptyMessage={
                        filteredCourses.length === 0
                            ? 'No courses match the selected departments.'
                            : 'No courses match your search.'
                    }
                    options={filteredCourses.map((course) => ({
                        value: course.id,
                        label: course.code || course.title,
                    }))}
                    selectedValues={selectedCourseIds ?? []}
                    onToggle={(value) => toggleStringValue('course_ids', value)}
                    visibleRows={3}
                />

                <AllocatedSectionsPicker form={form} />
            </div>
        </>
    );
}
