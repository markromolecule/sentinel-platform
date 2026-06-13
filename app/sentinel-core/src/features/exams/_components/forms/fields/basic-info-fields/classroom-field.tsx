import { useMemo, useState } from 'react';
import {
    Badge,
    Checkbox,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    ScrollArea,
    Input,
} from '@sentinel/ui';
import type { ExamClassroomOption } from '@/features/exams/config/_lib/classroom-options';
import type { ExamFormFieldProps } from '../_types';
import { School, Search, X } from 'lucide-react';

const labelClassName = 'text-[13px] font-bold text-foreground/70 flex items-center gap-2';

type ClassroomFieldProps = ExamFormFieldProps & {
    classroomIds: string[];
    classroomOptions: ExamClassroomOption[];
    isClassroomsLoading: boolean;
};

export function ClassroomField({ classroomIds, control, classroomOptions }: ClassroomFieldProps) {
    const [searchQuery, setSearchQuery] = useState('');

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

    const filteredClassroomOptions = useMemo(() => {
        if (!searchQuery.trim()) {
            return classroomOptions;
        }
        const query = searchQuery.toLowerCase();
        return classroomOptions.filter(
            (classroom) =>
                classroom.title.toLowerCase().includes(query) ||
                (classroom.subjectLabel && classroom.subjectLabel.toLowerCase().includes(query)) ||
                (classroom.sectionLabel && classroom.sectionLabel.toLowerCase().includes(query)),
        );
    }, [classroomOptions, searchQuery]);

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

                        {/* Selected Classrooms Chips Preview */}
                        {selectedClassrooms.length > 0 && (
                            <div className="flex max-h-[84px] flex-wrap gap-1.5 overflow-y-auto pb-1">
                                {selectedClassrooms.map((classroom) => (
                                    <Badge
                                        key={classroom.id}
                                        variant="secondary"
                                        className="flex h-6 shrink-0 items-center gap-1 rounded-full border-none bg-[#323d8f]/10 py-0.5 pr-1 pl-2.5 text-[11px] font-semibold text-[#323d8f]"
                                    >
                                        <span className="max-w-[180px] truncate">
                                            {classroom.title}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                const nextValue = classroomIds.filter(
                                                    (id) => id !== classroom.id,
                                                );
                                                field.onChange(nextValue);
                                            }}
                                            className="rounded-full p-0.5 text-[#323d8f]/70 transition-colors hover:bg-[#323d8f]/20 hover:text-[#323d8f]"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}

                        <div className="border-border/60 bg-muted/15 overflow-hidden rounded-xl border">
                            {/* Classroom Search Input */}
                            <div className="border-border/40 bg-background/50 relative flex items-center gap-2 border-b px-3 py-1.5">
                                <Search className="h-3.5 w-3.5 shrink-0 text-[#323d8f]/50" />
                                <Input
                                    type="text"
                                    placeholder="Search classrooms, subjects, or sections..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="placeholder:text-muted-foreground/60 h-7 w-full border-none bg-transparent p-0 text-xs shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        className="text-muted-foreground/60 hover:text-foreground hover:bg-muted rounded-full p-0.5 transition-colors"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                )}
                            </div>

                            <ScrollArea className="max-h-[168px]">
                                <div className="space-y-1 px-2 py-1.5">
                                    {filteredClassroomOptions.length === 0 ? (
                                        <div className="text-muted-foreground/80 rounded-lg px-3 py-8 text-center text-xs">
                                            {searchQuery
                                                ? 'No classrooms match search query.'
                                                : 'No classrooms available.'}
                                        </div>
                                    ) : (
                                        filteredClassroomOptions.map((classroom) => {
                                            const isChecked = classroomIds.includes(classroom.id);
                                            const isSubjectLocked =
                                                Boolean(lockedSubjectId) &&
                                                classroom.subjectId !== lockedSubjectId &&
                                                !isChecked;

                                            return (
                                                <label
                                                    key={classroom.id}
                                                    className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                                                        isSubjectLocked
                                                            ? 'cursor-not-allowed opacity-50'
                                                            : ''
                                                    } ${
                                                        isChecked
                                                            ? 'bg-[#323d8f]/5 hover:bg-[#323d8f]/10'
                                                            : 'hover:bg-muted/40'
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
                                                                className={`truncate text-[13px] font-semibold ${
                                                                    isChecked
                                                                        ? 'text-[#323d8f]'
                                                                        : 'text-foreground/90'
                                                                }`}
                                                            >
                                                                {classroom.title}
                                                            </span>
                                                            {classroom.sectionLabel ? (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="text-muted-foreground/80 bg-background h-4.5 px-1.5 text-[9px] font-bold tracking-wider uppercase"
                                                                >
                                                                    {classroom.sectionLabel}
                                                                </Badge>
                                                            ) : null}
                                                        </div>
                                                        <div className="text-muted-foreground/70 truncate text-[11px]">
                                                            {classroom.subjectLabel}
                                                        </div>
                                                        {isSubjectLocked ? (
                                                            <div className="mt-0.5 text-[9px] leading-none font-medium text-amber-600/90">
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
