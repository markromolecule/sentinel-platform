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

type BasicInfoFieldsProps = ExamFormFieldProps & {
    currentExamId?: string;
};

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
                            <FormLabel className="text-[13px] font-bold text-foreground/70 flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-[#323d8f]/60" />
                                Select Subject
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger className="h-10 border-border/60 bg-background transition-all focus:ring-2 focus:ring-[#323d8f]/20 focus:border-[#323d8f]">
                                        <SelectValue placeholder={isLoading ? "Loading subjects..." : "Select a subject"} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {subjects.map((subject) => {
                                        const id = subject.subject_id ?? subject.id ?? '';
                                        const code = subject.subject_code ?? subject.code ?? '';
                                        const title = subject.subject_title ?? subject.title ?? '';
                                        return (
                                            <SelectItem key={id} value={id}>
                                                {code} - {title}
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </ExamFormSection>
    );
}
