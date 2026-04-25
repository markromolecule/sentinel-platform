import { useFormContext, useWatch } from 'react-hook-form';
import { useDebounce, useSubjectsQuery } from '@sentinel/hooks';
import { FormField, FormItem, FormMessage } from '@sentinel/ui';
import { type SubjectClassificationFormValues } from '@sentinel/shared/schema';
import { FilterableCheckboxGroup } from '@/app/(protected)/subjects/_components/forms/filterable-checkbox-group';
import { useMemo, useState } from 'react';

const EMPTY_SUBJECT_IDS: string[] = [];

interface SubjectPickerSectionProps {
    isPending: boolean;
    open: boolean;
}

export function SubjectPickerSection({ isPending, open }: SubjectPickerSectionProps) {
    const { control, setValue } = useFormContext<SubjectClassificationFormValues>();
    const [subjectSearch, setSubjectSearch] = useState('');
    const [selectedSubjectLabels, setSelectedSubjectLabels] = useState<Record<string, string>>({});
    const debouncedSubjectSearch = useDebounce(subjectSearch, 400);
    const { data: subjects = [], isLoading: isLoadingSubjects } = useSubjectsQuery(
        debouncedSubjectSearch || undefined,
        open,
    );

    const selectedSubjectIds = useWatch({ control, name: 'subject_ids' }) ?? EMPTY_SUBJECT_IDS;
    const availableSubjectOptions = useMemo(
        () =>
            subjects
                .map((subject) => {
                    const value = subject.subject_id ?? subject.id ?? '';
                    if (!value) {
                        return null;
                    }

                    return {
                        value,
                        label: `${subject.subject_code ?? subject.code} - ${subject.subject_title ?? subject.title}`,
                    };
                })
                .filter((option): option is { value: string; label: string } => Boolean(option)),
        [subjects],
    );

    const subjectOptions = useMemo(() => {
        const mergedOptions = new Map<string, { value: string; label: string }>();

        availableSubjectOptions.forEach((option) => {
            mergedOptions.set(option.value, option);
        });

        selectedSubjectIds.forEach((subjectId) => {
            if (!mergedOptions.has(subjectId) && selectedSubjectLabels[subjectId]) {
                mergedOptions.set(subjectId, {
                    value: subjectId,
                    label: selectedSubjectLabels[subjectId],
                });
            }
        });

        return Array.from(mergedOptions.values());
    }, [availableSubjectOptions, selectedSubjectIds, selectedSubjectLabels]);

    function rememberSubjectLabels(ids: string[]) {
        if (ids.length === 0) {
            return;
        }

        setSelectedSubjectLabels((current) => {
            const next = { ...current };
            const availableLabelMap = new Map(
                availableSubjectOptions.map((option) => [option.value, option.label]),
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

    return (
        <FormField
            control={control}
            name="subject_ids"
            render={() => (
                <FormItem className="border-border/60 bg-muted/10 rounded-2xl border p-4">
                    <FilterableCheckboxGroup
                        title="Assigned Subjects"
                        searchPlaceholder="Search subjects..."
                        emptyMessage={
                            isLoadingSubjects
                                ? 'Loading subjects...'
                                : 'No subjects match your search.'
                        }
                        options={subjectOptions.filter((option) => Boolean(option.value))}
                        selectedValues={selectedSubjectIds}
                        onToggle={(subjectId) => {
                            const nextValue = selectedSubjectIds.includes(subjectId)
                                ? selectedSubjectIds.filter((value) => value !== subjectId)
                                : [...selectedSubjectIds, subjectId];

                            rememberSubjectLabels(nextValue);
                            setValue('subject_ids', nextValue, {
                                shouldDirty: true,
                                shouldValidate: true,
                            });
                        }}
                        onSetSelectedValues={(values) => {
                            rememberSubjectLabels(values);
                            setValue('subject_ids', values, {
                                shouldDirty: true,
                                shouldValidate: true,
                            });
                        }}
                        helperText="Choose the catalog subjects that belong to this shared classification card."
                        selectionSummary={
                            selectedSubjectIds.length > 0
                                ? `${selectedSubjectIds.length} subjects assigned`
                                : 'No subjects assigned yet'
                        }
                        searchValue={subjectSearch}
                        onSearchChange={(value) => {
                            rememberSubjectLabels(selectedSubjectIds);
                            setSubjectSearch(value);
                        }}
                        disableLocalFiltering
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
