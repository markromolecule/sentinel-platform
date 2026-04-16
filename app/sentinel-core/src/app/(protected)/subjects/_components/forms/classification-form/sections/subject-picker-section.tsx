import { useFormContext, useWatch } from 'react-hook-form';
import { FormField, FormItem, FormMessage } from '@sentinel/ui';
import { type SubjectClassificationFormValues } from '@sentinel/shared/schema';
import { FilterableCheckboxGroup } from '@/app/(protected)/subjects/_components/forms/filterable-checkbox-group';
import { useClassificationOptions } from '../hooks/use-classification-options';
import { type MasterSubject } from '@sentinel/shared/types';

interface SubjectPickerSectionProps {
    subjects: MasterSubject[];
    isLoadingSubjects: boolean;
    isPending: boolean;
}

export function SubjectPickerSection({
    subjects,
    isLoadingSubjects,
    isPending,
}: SubjectPickerSectionProps) {
    const { control, setValue } = useFormContext<SubjectClassificationFormValues>();
    const { subjectOptions } = useClassificationOptions({ subjects });

    const selectedSubjectIds = useWatch({ control, name: 'subject_ids' }) ?? [];

    return (
        <FormField
            control={control}
            name="subject_ids"
            render={() => (
                <FormItem className="rounded-2xl border border-border/60 bg-muted/10 p-4">
                    <FilterableCheckboxGroup
                        title="Assigned Subjects"
                        searchPlaceholder="Search subjects..."
                        emptyMessage={
                            isLoadingSubjects ? 'Loading subjects...' : 'No subjects match your search.'
                        }
                        options={subjectOptions.filter((option) => Boolean(option.value))}
                        selectedValues={selectedSubjectIds}
                        onToggle={(subjectId) => {
                            const nextValue = selectedSubjectIds.includes(subjectId)
                                ? selectedSubjectIds.filter((value) => value !== subjectId)
                                : [...selectedSubjectIds, subjectId];

                            setValue('subject_ids', nextValue, {
                                shouldDirty: true,
                                shouldValidate: true,
                            });
                        }}
                        onSetSelectedValues={(values) =>
                            setValue('subject_ids', values, {
                                shouldDirty: true,
                                shouldValidate: true,
                            })
                        }
                        helperText="Choose the catalog subjects that belong to this shared classification card."
                        selectionSummary={
                            selectedSubjectIds.length > 0
                                ? `${selectedSubjectIds.length} subjects assigned`
                                : 'No subjects assigned yet'
                        }
                        visibleRows={10}
                        disabled={isPending || isLoadingSubjects}
                        headerDensity="compact"
                        listClassName="max-h-[420px]"
                    />
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}
