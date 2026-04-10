import { useSectionsQuery, useStableOptions, useStableValue } from '@sentinel/hooks';
import { FormField, FormItem, FormMessage } from '@sentinel/ui';
import { useEffect } from 'react';
import { useWatch } from 'react-hook-form';
import { FilterableCheckboxGroup } from '@/app/(protected)/(admin)/subjects/_components/forms/filterable-checkbox-group';
import { type SubjectOfferingFormFieldsProps } from '../_types';

interface SectionPickerFieldProps {
    form: SubjectOfferingFormFieldsProps['form'];
    isPending: boolean;
    sectionSummary: string;
    visibleRows?: number;
}

export function SectionPickerField({
    form,
    isPending,
    sectionSummary,
    visibleRows = 11,
}: SectionPickerFieldProps) {
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

    const filteredSections = useStableValue(
        () =>
            sections.filter((section) => {
                const matchesDepartment =
                    !selectedDepartmentIds?.length ||
                    (section.departmentId
                        ? selectedDepartmentIds.includes(section.departmentId)
                        : false);
                const matchesCourse =
                    !selectedCourseIds?.length ||
                    (section.courseId ? selectedCourseIds.includes(section.courseId) : false);
                const matchesYear =
                    !selectedYearLevels?.length ||
                    (section.yearLevel ? selectedYearLevels.includes(section.yearLevel) : false);

                return matchesDepartment && matchesCourse && matchesYear;
            }),
        [sections, selectedCourseIds, selectedDepartmentIds, selectedYearLevels],
    );
    const sectionOptions = useStableOptions(filteredSections, (section) => section.name);

    useEffect(() => {
        const allowedSectionIds = new Set(filteredSections.map((section) => section.id));
        const nextSectionIds = (selectedSectionIds ?? []).filter((sectionId) =>
            allowedSectionIds.has(sectionId),
        );

        if (nextSectionIds.length !== (selectedSectionIds ?? []).length) {
            form.setValue('section_ids', nextSectionIds, {
                shouldDirty: true,
                shouldValidate: true,
            });
        }
    }, [filteredSections, form, selectedSectionIds]);

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

    function setSectionIds(values: string[]) {
        form.setValue('section_ids', values, {
            shouldDirty: true,
            shouldValidate: true,
        });
    }

    return (
        <FormField
            control={form.control}
            name="section_ids"
            render={() => (
                <FormItem className="h-full">
                    <FilterableCheckboxGroup
                        title="Sections"
                        searchPlaceholder="Filter sections..."
                        emptyMessage={
                            filteredSections.length === 0
                                ? 'No sections match the selected department, course, and year levels.'
                                : 'No sections match your search.'
                        }
                        options={sectionOptions}
                        selectedValues={selectedSectionIds ?? []}
                        onToggle={toggleSection}
                        helperText="Filtered by the department, course, and year you choose."
                        selectionSummary={sectionSummary}
                        visibleRows={visibleRows}
                        disabled={isPending}
                        onSetSelectedValues={setSectionIds}
                    />
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}
