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
import { type MasterSubject } from '@sentinel/shared/types';

interface TargetAssignmentFieldsProps {
    subjects: MasterSubject[];
    isPending: boolean;
}

export function TargetAssignmentFields({ subjects, isPending }: TargetAssignmentFieldsProps) {
    const { control, setValue } = useFormContext<SubjectClassificationFormValues>();
    const classificationType = useWatch({ control, name: 'type' });

    const {
        isAdmin,
        deptOptions,
        filteredCourseOptions,
        courseSummary,
        isLoadingDepts,
        isLoadingCourses,
    } = useClassificationOptions({ subjects });

    if (classificationType !== 'CORE') return null;

    const selectedCourseIds = (control._formValues.course_ids as string[]) ?? [];

    return (
        <div className="space-y-4 rounded-2xl border border-primary/10 bg-muted/10 p-4">
            <FormField
                control={control}
                name="department_id"
                render={({ field }) => (
                    <FormItem className="space-y-1.5">
                        <FormLabel className="text-[12px] uppercase tracking-wider font-bold text-foreground/50">
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
                                <SelectTrigger className="h-10 bg-background/50 border-muted-foreground/20 focus:ring-primary/20">
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
                <FormLabel className="text-[12px] uppercase tracking-wider font-bold text-foreground/50">
                    Target Courses
                </FormLabel>
                <FilterableCheckboxGroup
                    title="Courses"
                    searchPlaceholder="Search courses..."
                    emptyMessage={
                        isLoadingCourses
                            ? 'Searching departments...'
                            : 'No courses found under the selected department.'
                    }
                    options={filteredCourseOptions}
                    selectedValues={selectedCourseIds}
                    onToggle={(courseId) => {
                        if (isAdmin) return;
                        const nextValue = selectedCourseIds.includes(courseId)
                            ? selectedCourseIds.filter((v) => v !== courseId)
                            : [...selectedCourseIds, courseId];
                        setValue('course_ids', nextValue, {
                            shouldDirty: true,
                        });
                    }}
                    onSetSelectedValues={(vals) => {
                        if (isAdmin) return;
                        setValue('course_ids', vals, {
                            shouldDirty: true,
                        });
                    }}
                    disabled={isAdmin || isPending || isLoadingCourses}
                    selectionSummary={courseSummary}
                    helperText={
                        isAdmin ? 'Fixed to your assignment' : 'Available under the selected department'
                    }
                    variant="compact"
                    headerDensity="compact"
                    listClassName="max-h-[220px]"
                />
            </div>
        </div>
    );
}
