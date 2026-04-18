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
import type {
    ExamSectionOption,
    ExamSubjectOption,
} from '@/features/exams/config/_lib/enrolled-subject-options';
import type { ExamFormFieldProps } from '../_types';
import { BookOpen, Users } from 'lucide-react';
import { FilterableCheckboxGroup } from '@/app/(protected)/(instructor)/subjects/_components/forms/filterable-checkbox-group';

type SubjectSectionFieldsProps = ExamFormFieldProps & {
    availableSections: ExamSectionOption[];
    isSubjectsLoading: boolean;
    subjectId?: string;
    subjectOptions: ExamSubjectOption[];
};

const labelClassName = 'text-[13px] font-bold text-foreground/70 flex items-center gap-2';
const triggerClassName =
    'h-11 w-full min-w-0 overflow-hidden border-border/60 bg-background transition-all focus:ring-2 focus:ring-[#323d8f]/20 focus:border-[#323d8f] [&>span]:flex-1 [&>span]:truncate [&>span]:text-left';

export function SubjectSectionFields({
    availableSections,
    control,
    isSubjectsLoading,
    subjectId,
    subjectOptions,
}: SubjectSectionFieldsProps) {
    return (
        <div className="space-y-6">
            <FormField
                control={control}
                name="subjectId"
                render={({ field: { value, ...fieldProps } }) => (
                    <FormItem className="min-w-0 space-y-2.5">
                        <FormLabel className={labelClassName}>
                            <BookOpen className="h-4 w-4 text-[#323d8f]/60" />
                            Subject
                        </FormLabel>
                        <Select
                            onValueChange={fieldProps.onChange}
                            value={(value as string) || undefined}
                        >
                            <FormControl>
                                <SelectTrigger className={triggerClassName}>
                                    <SelectValue
                                        placeholder={
                                            isSubjectsLoading
                                                ? 'Loading subjects...'
                                                : 'Select a subject'
                                        }
                                    />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-[300px]">
                                {subjectOptions.map((subject) => (
                                    <SelectItem
                                        key={subject.id}
                                        value={subject.id}
                                        className="truncate pr-8"
                                    >
                                        {subject.title} ({subject.code})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="sectionIds"
                render={({ field: { value, onChange } }) => {
                    const selectedValues = (value as string[]) || [];

                    const toggleSection = (sectionId: string) => {
                        const next = selectedValues.includes(sectionId)
                            ? selectedValues.filter((id) => id !== sectionId)
                            : [...selectedValues, sectionId];
                        onChange(next);
                    };

                    const toggleAll = (ids: string[], checked: boolean) => {
                        if (checked) {
                            onChange(Array.from(new Set([...selectedValues, ...ids])));
                        } else {
                            onChange(selectedValues.filter((id) => !ids.includes(id)));
                        }
                    };

                    return (
                        <FormItem className="space-y-2.5">
                            <FormLabel className={labelClassName}>
                                <Users className="h-4 w-4 text-[#323d8f]/60" />
                                Assigned Sections
                            </FormLabel>
                            <div className="border-border/60 bg-background rounded-xl border p-4">
                                <FilterableCheckboxGroup
                                    title="Sections"
                                    searchPlaceholder={
                                        subjectId ? 'Filter sections...' : 'Pick a subject first'
                                    }
                                    emptyMessage={
                                        subjectId
                                            ? 'No sections match filters.'
                                            : 'Please select a subject to see available sections.'
                                    }
                                    options={availableSections.map((s) => ({
                                        value: s.id,
                                        label: s.name,
                                    }))}
                                    selectedValues={selectedValues}
                                    onToggle={toggleSection}
                                    onToggleAll={toggleAll}
                                    visibleRows={8}
                                />
                            </div>
                            <FormMessage />
                        </FormItem>
                    );
                }}
            />
        </div>
    );
}
