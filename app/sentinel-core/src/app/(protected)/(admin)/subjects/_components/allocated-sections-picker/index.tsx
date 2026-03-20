import { useWatch } from 'react-hook-form';
import { useSectionsQuery } from '@/hooks/query/sections/use-sections-query';
import { type AllocatedSectionsPickerProps } from './_types';
import { FilterableCheckboxGroup } from '@/app/(protected)/(admin)/subjects/_components/filterable-checkbox-group';

export function AllocatedSectionsPicker({ form }: AllocatedSectionsPickerProps) {
    const { data: sections = [] } = useSectionsQuery();

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
    const selectedSectionIds = useWatch({
        control: form.control,
        name: 'section_ids',
    });

    const filteredSections = sections.filter((section) => {
        const matchesDepartment =
            !selectedDepartmentIds?.length ||
            (section.departmentId ? selectedDepartmentIds.includes(section.departmentId) : false);
        const matchesCourse =
            !selectedCourseIds?.length ||
            (section.courseId ? selectedCourseIds.includes(section.courseId) : false);
        const matchesYear =
            !selectedYearLevels?.length ||
            (section.yearLevel ? selectedYearLevels.includes(section.yearLevel) : false);

        return matchesDepartment && matchesCourse && matchesYear;
    });

    function toggleSection(sectionId: string) {
        const current = form.getValues('section_ids') ?? [];
        const next = current.includes(sectionId)
            ? current.filter((value) => value !== sectionId)
            : [...current, sectionId];

        form.setValue('section_ids', next, {
            shouldDirty: true,
            shouldValidate: true,
        });
    }

    return (
        <FilterableCheckboxGroup
            title="Allocated Sections"
            searchPlaceholder="Filter sections..."
            emptyMessage={
                filteredSections.length === 0
                    ? 'No sections match the selected department, course, and year levels.'
                    : 'No sections match your search.'
            }
            options={filteredSections.map((section) => ({
                value: section.id,
                label: section.name,
            }))}
            selectedValues={selectedSectionIds ?? []}
            onToggle={toggleSection}
            helperText="Sections are filtered by selected Department, Course, and Year Level."
            visibleRows={3}
        />
    );
}
