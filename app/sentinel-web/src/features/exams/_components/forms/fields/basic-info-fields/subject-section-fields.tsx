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
        <div className="grid gap-6 md:grid-cols-2">
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
                name="section"
                render={({ field: { value, ...fieldProps } }) => (
                    <FormItem className="min-w-0 space-y-2.5">
                        <FormLabel className={labelClassName}>
                            <Users className="h-4 w-4 text-[#323d8f]/60" />
                            Section
                        </FormLabel>
                        <Select
                            disabled={!subjectId || availableSections.length === 0}
                            onValueChange={fieldProps.onChange}
                            value={(value as string) || undefined}
                        >
                            <FormControl>
                                <SelectTrigger className={triggerClassName}>
                                    <SelectValue
                                        placeholder={
                                            subjectId ? 'Select a section' : 'Pick a subject first'
                                        }
                                    />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-[300px]">
                                {availableSections.map((sectionOption) => (
                                    <SelectItem
                                        key={sectionOption.id}
                                        value={sectionOption.name}
                                        className="truncate pr-8"
                                    >
                                        {sectionOption.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}
