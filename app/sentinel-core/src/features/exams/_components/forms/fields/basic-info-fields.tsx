'use client';

import type { ExamFormFieldProps } from './_types';
import { ExamFormSection } from '@/features/exams/_components/forms/components';
import { BasicDetailsFields } from './basic-info-fields/basic-details-fields';
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
import { useSubjectsQuery } from '@sentinel/hooks';
import { BookOpen } from 'lucide-react';
import { SubjectSearchCombobox } from './basic-info-fields/subject-search-combobox';

type BasicInfoFieldsProps = ExamFormFieldProps & {
    currentExamId?: string;
};

/**
 * BasicInfoFields renders form fields for general exam metadata, including a searchable
 * subject selection combobox for administrators.
 *
 * @param props.control - Form control object from react-hook-form.
 * @param props.currentExamId - Optional ID of the exam being edited.
 */
export function BasicInfoFields({ control, currentExamId }: BasicInfoFieldsProps) {
    const { data: subjects = [], isLoading } = useSubjectsQuery();

    return (
        <ExamFormSection title="General Info" description="Core details for your exam session.">
            <div className="grid gap-4">
                <BasicDetailsFields control={control} />
                <FormField
                    control={control}
                    name="subjectId"
                    render={({ field }) => (
                        <FormItem className="space-y-2">
                            <FormLabel className="text-foreground/70 flex items-center gap-2 text-[13px] font-bold">
                                <BookOpen className="h-4 w-4 text-[#323d8f]/60" />
                                Select Subject
                            </FormLabel>
                            <SubjectSearchCombobox
                                value={field.value}
                                onValueChange={field.onChange}
                                subjects={subjects}
                                isLoading={isLoading}
                            />
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </ExamFormSection>
    );
}
