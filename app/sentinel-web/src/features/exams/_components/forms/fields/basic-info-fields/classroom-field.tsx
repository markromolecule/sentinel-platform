import {
    FormDescription,
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
import type { ExamClassroomOption } from '@/features/exams/config/_lib/classroom-options';
import type { ExamFormFieldProps } from '../_types';
import { School } from 'lucide-react';

type ClassroomFieldProps = ExamFormFieldProps & {
    classroomId?: string;
    classroomOptions: ExamClassroomOption[];
    isClassroomsLoading: boolean;
};

const labelClassName = 'text-[13px] font-bold text-foreground/70 flex items-center gap-2';
const triggerClassName =
    'h-11 w-full min-w-0 overflow-hidden border-border/60 bg-background transition-all focus:ring-2 focus:ring-[#323d8f]/20 focus:border-[#323d8f] [&>span]:flex-1 [&>span]:truncate [&>span]:text-left';

export function ClassroomField({
    classroomId,
    control,
    classroomOptions,
    isClassroomsLoading,
}: ClassroomFieldProps) {
    return (
        <div className="space-y-4">
            <FormField
                control={control}
                name="classroomId"
                render={({ field: { value, ...fieldProps } }) => (
                    <FormItem className="min-w-0 space-y-2.5">
                        <FormLabel className={labelClassName}>
                            <School className="h-4 w-4 text-[#323d8f]/60" />
                            Classroom
                        </FormLabel>
                        <Select
                            onValueChange={fieldProps.onChange}
                            value={(value as string) || undefined}
                        >
                            <FormControl>
                                <SelectTrigger className={triggerClassName}>
                                    <SelectValue
                                        placeholder={
                                            isClassroomsLoading
                                                ? 'Loading classrooms...'
                                                : 'Select a classroom'
                                        }
                                    />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-[300px]">
                                {classroomOptions.map((classroom) => (
                                    <SelectItem
                                        key={classroom.id}
                                        value={classroom.id}
                                        className="truncate pr-8"
                                    >
                                        {classroom.title}
                                        {classroom.sectionLabel
                                            ? ` • ${classroom.sectionLabel}`
                                            : ''}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormDescription>
                            Exams now inherit subject, section, term, and roster scope from the
                            selected classroom.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
            {classroomId ? (
                <div className="border-border/60 bg-muted/25 rounded-xl border p-4 text-sm">
                    {classroomOptions
                        .filter((classroom) => classroom.id === classroomId)
                        .map((classroom) => (
                            <div key={classroom.id} className="space-y-1">
                                <div className="font-medium">{classroom.title}</div>
                                <div className="text-muted-foreground">
                                    {classroom.subjectLabel}
                                </div>
                                <div className="text-muted-foreground">
                                    {[classroom.sectionLabel, classroom.termLabel]
                                        .filter(Boolean)
                                        .join(' • ')}
                                </div>
                            </div>
                        ))}
                </div>
            ) : null}
        </div>
    );
}
