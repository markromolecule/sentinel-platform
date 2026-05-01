import { useFormContext, useWatch } from 'react-hook-form';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@sentinel/ui';
import { type SubjectClassificationFormValues } from '@sentinel/shared/schema';
import { FilterableCheckboxGroup } from '@/app/(protected)/subjects/_components/forms/filterable-checkbox-group';
import { useClassificationOptions } from '../hooks/use-classification-options';
import { useDebounce, useCoursesQuery } from '@sentinel/hooks';
import { useState } from 'react';

interface TargetAssignmentFieldsProps {
    isPending: boolean;
}

export function TargetAssignmentFields({ isPending }: TargetAssignmentFieldsProps) {
    const { control, setValue } = useFormContext<SubjectClassificationFormValues>();
    const classificationType = useWatch({ control, name: 'type' });
    const [courseSearch, setCourseSearch] = useState('');
    const [selectedCourseLabels, setSelectedCourseLabels] = useState<Record<string, string>>({});
    const debouncedCourseSearch = useDebounce(courseSearch, 400);

    const { isAdmin, deptOptions, courseSummary, isLoadingDepts } = useClassificationOptions();

    const selectedDepartmentId = useWatch({ control, name: 'department_id' });
    const selectedCourseIds = useWatch({ control, name: 'course_ids' }) ?? [];
    const shouldQueryCourses = classificationType === 'CORE' && Boolean(selectedDepartmentId);
    const { data: courseData = [], isLoading: isLoadingCourses } = useCoursesQuery(
        debouncedCourseSearch || undefined,
        undefined,
        shouldQueryCourses,
    );

    const filteredCourseOptions = courseData
        .filter((course) => (course.department_id ?? course.departmentId) === selectedDepartmentId)
        .map((course) => ({
            value: course.course_id ?? course.id,
            label: `${course.code} - ${course.title}`,
        }));

    const knownCourseOptions = new Map(
        filteredCourseOptions.map((option) => [option.value, option]),
    );

    selectedCourseIds.forEach((courseId) => {
        if (!knownCourseOptions.has(courseId) && selectedCourseLabels[courseId]) {
            knownCourseOptions.set(courseId, {
                value: courseId,
                label: selectedCourseLabels[courseId],
            });
        }
    });

    const mergedCourseOptions = Array.from(knownCourseOptions.values());

    function rememberCourseLabels(ids: string[]) {
        if (ids.length === 0) {
            return;
        }

        setSelectedCourseLabels((current) => {
            const next = { ...current };
            const availableLabelMap = new Map(
                filteredCourseOptions.map((option) => [option.value, option.label]),
            );

            ids.forEach((id) => {
                const label = availableLabelMap.get(id);

                if (label) {
                    next[id] = label;
                }
            });

            return next;
        });
    }

    if (classificationType !== 'CORE') return null;

    return (
        <div className="border-primary/10 bg-muted/10 space-y-4 rounded-2xl border p-4">
            <FormField
                control={control}
                name="department_id"
                render={({ field }) => (
                    <FormItem className="space-y-1.5">
                        <FormLabel className="text-foreground/50 text-[12px] font-bold tracking-wider uppercase">
                            Target Department
                        </FormLabel>
                        <Select
                            value={field.value ?? ''}
                            onValueChange={(val) => {
                                field.onChange(val);
                                setValue('course_ids', []);
                            }}
                            disabled={isAdmin || isPending || isLoadingDepts}
                        >
                            <FormControl>
                                <SelectTrigger className="bg-background/50 border-muted-foreground/20 focus:ring-primary/20 h-10">
                                    <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {deptOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <div className="space-y-1.5">
                <FormLabel className="text-foreground/50 text-[12px] font-bold tracking-wider uppercase">
                    Target Courses
                </FormLabel>
                <FilterableCheckboxGroup
                    title="Courses"
                    searchPlaceholder="Search courses..."
                    emptyMessage={
                        isLoadingCourses
                            ? 'Loading courses...'
                            : 'No courses found under the selected department.'
                    }
                    options={mergedCourseOptions}
                    selectedValues={selectedCourseIds}
                    onToggle={(courseId) => {
                        if (isAdmin) return;
                        const nextValue = selectedCourseIds.includes(courseId)
                            ? selectedCourseIds.filter((v) => v !== courseId)
                            : [...selectedCourseIds, courseId];
                        rememberCourseLabels(nextValue);
                        setValue('course_ids', nextValue, {
                            shouldDirty: true,
                        });
                    }}
                    onSetSelectedValues={(vals) => {
                        if (isAdmin) return;
                        rememberCourseLabels(vals);
                        setValue('course_ids', vals, {
                            shouldDirty: true,
                        });
                    }}
                    disabled={isAdmin || isPending || isLoadingCourses}
                    selectionSummary={courseSummary}
                    helperText={
                        isAdmin
                            ? 'Fixed to your assignment'
                            : 'Available under the selected department'
                    }
                    searchValue={courseSearch}
                    onSearchChange={(value) => {
                        rememberCourseLabels(selectedCourseIds);
                        setCourseSearch(value);
                    }}
                    disableLocalFiltering
                    variant="compact"
                    headerDensity="compact"
                    listClassName="max-h-[220px]"
                />
            </div>
        </div>
    );
}
