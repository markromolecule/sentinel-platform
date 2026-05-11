import { useMemo } from 'react';
import {
    Badge,
    Checkbox,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    ScrollArea,
} from '@sentinel/ui';
import type { ExamClassroomOption } from '@/features/exams/config/_lib/classroom-options';
import type { ExamFormFieldProps } from '../_types';
import { School } from 'lucide-react';

const labelClassName = 'text-[13px] font-bold text-foreground/70 flex items-center gap-2';

type ClassroomFieldProps = ExamFormFieldProps & {
    classroomIds: string[];
    classroomOptions: ExamClassroomOption[];
    isClassroomsLoading: boolean;
};

export function ClassroomField({ classroomIds, control, classroomOptions }: ClassroomFieldProps) {
    const selectedClassrooms = useMemo(
        () =>
            classroomOptions
                .filter((classroom) => classroomIds.includes(classroom.id))
                .sort(
                    (left, right) => classroomIds.indexOf(left.id) - classroomIds.indexOf(right.id),
                ),
        [classroomIds, classroomOptions],
    );
    const lockedSubjectId = selectedClassrooms[0]?.subjectId ?? null;

    return (
        <div className="space-y-4">
            <FormField
                control={control}
                name="classroomIds"
                render={({ field }) => (
                    <FormItem className="min-w-0 space-y-3">
                        <FormLabel className={`${labelClassName} justify-between`}>
                            <div className="flex items-center gap-2">
                                <School className="h-4 w-4 text-[#323d8f]/60" />
                                Select Classrooms
                            </div>
                            {selectedClassrooms.length > 0 && (
                                <Badge
                                    variant="secondary"
                                    className="h-5 border-none bg-[#323d8f]/10 px-2 py-0 text-[10px] font-bold text-[#323d8f]"
                                >
                                    {selectedClassrooms.length} SELECTED
                                </Badge>
                            )}
                        </FormLabel>
                        <div className="border-border/60 bg-muted/15 rounded-xl border">
                            <ScrollArea className="max-h-[168px]">
                                <div className="divide-border/30 divide-y px-3 py-1">
                                    {classroomOptions.length === 0 ? (
                                        <div className="text-muted-foreground rounded-lg px-3 py-6 text-sm">
                                            No classrooms available.
                                        </div>
                                    ) : (
                                        classroomOptions.map((classroom) => {
                                            const isChecked = classroomIds.includes(classroom.id);
                                            const isSubjectLocked =
                                                Boolean(lockedSubjectId) &&
                                                classroom.subjectId !== lockedSubjectId &&
                                                !isChecked;

                                            return (
                                                <label
                                                    key={classroom.id}
                                                    className={`flex cursor-pointer items-center gap-3 px-1 py-2.5 transition-colors ${isSubjectLocked ? 'opacity-50' : ''
                                                        }`}
                                                >
                                                    <Checkbox
                                                        checked={isChecked}
                                                        disabled={isSubjectLocked}
                                                        onCheckedChange={(checked) => {
                                                            const nextValue = checked
                                                                ? Array.from(
                                                                    new Set([
                                                                        ...classroomIds,
                                                                        classroom.id,
                                                                    ]),
                                                                )
                                                                : classroomIds.filter(
                                                                    (id) => id !== classroom.id,
                                                                );

                                                            field.onChange(nextValue);
                                                        }}
                                                    />
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex min-w-0 items-center gap-2">
                                                            <span
                                                                className={`truncate text-[13px] font-semibold ${isChecked
                                                                    ? 'text-[#323d8f]'
                                                                    : 'text-foreground/90'
                                                                    }`}
                                                            >
                                                                {classroom.title}
                                                            </span>
                                                            {classroom.sectionLabel ? (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="text-muted-foreground/80 h-4.5 px-1.5 text-[9px] font-bold tracking-wider uppercase"
                                                                >
                                                                    {classroom.sectionLabel}
                                                                </Badge>
                                                            ) : null}
                                                        </div>
                                                        <div className="text-muted-foreground/70 truncate text-[11px]">
                                                            {classroom.subjectLabel}
                                                        </div>
                                                        {isSubjectLocked ? (
                                                            <div className="text-[9px] font-medium leading-none text-amber-600/90">
                                                                Keep all targets under one subject
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                </label>
                                            );
                                        })
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                        <FormDescription className="text-[11px]">
                            * Classroom options are based on your configured teaching scope.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}
