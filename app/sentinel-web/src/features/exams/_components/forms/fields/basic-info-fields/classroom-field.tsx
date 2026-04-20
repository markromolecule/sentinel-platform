import { useMemo, useState } from 'react';
import {
    Badge,
    Checkbox,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Input,
    ScrollArea,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@sentinel/ui';
import type { ExamClassroomOption } from '@/features/exams/config/_lib/classroom-options';
import type { ExamFormFieldProps } from '../_types';
import { School, Search } from 'lucide-react';

type ClassroomFieldProps = ExamFormFieldProps & {
    classroomIds: string[];
    classroomOptions: ExamClassroomOption[];
    isClassroomsLoading: boolean;
};

const ALL_FILTER = 'all';
const labelClassName = 'text-[13px] font-bold text-foreground/70 flex items-center gap-2';
const triggerClassName =
    'h-11 w-full min-w-0 overflow-hidden border-border/60 bg-background transition-all focus:ring-2 focus:ring-[#323d8f]/20 focus:border-[#323d8f] [&>span]:flex-1 [&>span]:truncate [&>span]:text-left';
const inputClassName =
    'h-11 border-border/60 bg-background transition-all focus:ring-2 focus:ring-[#323d8f]/20 focus:border-[#323d8f]';

function buildFilterOptions(
    classrooms: ExamClassroomOption[],
    getKey: (classroom: ExamClassroomOption) => string | null,
    getLabel: (classroom: ExamClassroomOption) => string | null,
) {
    return Array.from(
        new Map(
            classrooms
                .map((classroom) => {
                    const key = getKey(classroom);
                    const label = getLabel(classroom);

                    return key && label ? ([key, label] as const) : null;
                })
                .filter((entry): entry is readonly [string, string] => Boolean(entry)),
        ).entries(),
    )
        .map(([value, label]) => ({ value, label }))
        .sort((left, right) => left.label.localeCompare(right.label));
}

export function ClassroomField({
    classroomIds,
    control,
    classroomOptions,
    isClassroomsLoading,
}: ClassroomFieldProps) {
    const [searchValue, setSearchValue] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState(ALL_FILTER);
    const [courseFilter, setCourseFilter] = useState(ALL_FILTER);
    const [subjectFilter, setSubjectFilter] = useState(ALL_FILTER);

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
    const departmentOptions = useMemo(
        () =>
            buildFilterOptions(
                classroomOptions,
                (classroom) => classroom.departmentId,
                (classroom) => classroom.departmentLabel,
            ),
        [classroomOptions],
    );
    const courseOptions = useMemo(
        () =>
            buildFilterOptions(
                classroomOptions,
                (classroom) => classroom.courseId,
                (classroom) => classroom.courseLabel,
            ),
        [classroomOptions],
    );
    const subjectOptions = useMemo(
        () =>
            buildFilterOptions(
                classroomOptions,
                (classroom) => classroom.subjectId,
                (classroom) => classroom.subjectLabel,
            ),
        [classroomOptions],
    );
    const visibleClassrooms = useMemo(() => {
        const normalizedSearch = searchValue.trim().toLowerCase();

        return classroomOptions.filter((classroom) => {
            if (departmentFilter !== ALL_FILTER && classroom.departmentId !== departmentFilter) {
                return false;
            }

            if (courseFilter !== ALL_FILTER && classroom.courseId !== courseFilter) {
                return false;
            }

            if (subjectFilter !== ALL_FILTER && classroom.subjectId !== subjectFilter) {
                return false;
            }

            if (!normalizedSearch) {
                return true;
            }

            return [
                classroom.title,
                classroom.subjectLabel,
                classroom.sectionLabel,
                classroom.departmentLabel,
                classroom.courseLabel,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase()
                .includes(normalizedSearch);
        });
    }, [classroomOptions, courseFilter, departmentFilter, searchValue, subjectFilter]);

    return (
        <div className="space-y-4">
            <FormField
                control={control}
                name="classroomIds"
                render={({ field }) => (
                    <FormItem className="min-w-0 space-y-3">
                        <FormLabel className={labelClassName}>
                            <School className="h-4 w-4 text-[#323d8f]/60" />
                            Assignment Scope
                        </FormLabel>
                        <div className="grid gap-3 lg:grid-cols-3">
                            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                                <SelectTrigger className={triggerClassName}>
                                    <SelectValue placeholder="Filter by department" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ALL_FILTER}>All departments</SelectItem>
                                    {departmentOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={courseFilter} onValueChange={setCourseFilter}>
                                <SelectTrigger className={triggerClassName}>
                                    <SelectValue placeholder="Filter by course" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ALL_FILTER}>All courses</SelectItem>
                                    {courseOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                                <SelectTrigger className={triggerClassName}>
                                    <SelectValue placeholder="Filter by subject" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ALL_FILTER}>All subjects</SelectItem>
                                    {subjectOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="relative">
                            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                            <Input
                                value={searchValue}
                                onChange={(event) => setSearchValue(event.target.value)}
                                placeholder={
                                    isClassroomsLoading
                                        ? 'Loading classrooms...'
                                        : 'Search classroom, subject, or section'
                                }
                                className={`${inputClassName} pl-9`}
                            />
                        </div>
                        <div className="border-border/60 bg-muted/15 rounded-xl border">
                            <ScrollArea className="max-h-72">
                                <div className="space-y-2 p-3">
                                    {visibleClassrooms.length === 0 ? (
                                        <div className="text-muted-foreground rounded-lg px-3 py-6 text-sm">
                                            No classrooms match the current filters.
                                        </div>
                                    ) : (
                                        visibleClassrooms.map((classroom) => {
                                            const isChecked = classroomIds.includes(classroom.id);
                                            const isSubjectLocked =
                                                Boolean(lockedSubjectId) &&
                                                classroom.subjectId !== lockedSubjectId &&
                                                !isChecked;

                                            return (
                                                <label
                                                    key={classroom.id}
                                                    className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-3 transition-colors ${
                                                        isChecked
                                                            ? 'border-[#323d8f]/30 bg-[#323d8f]/5'
                                                            : 'border-border/50 bg-background'
                                                    } ${isSubjectLocked ? 'opacity-50' : ''}`}
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
                                                    <div className="min-w-0 flex-1 space-y-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className="font-medium">
                                                                {classroom.title}
                                                            </span>
                                                            {classroom.sectionLabel ? (
                                                                <Badge variant="secondary">
                                                                    {classroom.sectionLabel}
                                                                </Badge>
                                                            ) : null}
                                                        </div>
                                                        <div className="text-muted-foreground text-sm">
                                                            {classroom.subjectLabel}
                                                        </div>
                                                        <div className="text-muted-foreground text-xs">
                                                            {[
                                                                classroom.departmentLabel,
                                                                classroom.courseLabel,
                                                                classroom.termLabel,
                                                            ]
                                                                .filter(Boolean)
                                                                .join(' • ') ||
                                                                'No extra scope labels'}
                                                        </div>
                                                        {isSubjectLocked ? (
                                                            <div className="text-xs text-amber-600">
                                                                Keep all targets under one subject
                                                                for this exam.
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
                        <FormDescription>
                            Filter by course, department, and subject to discover targets, then save
                            only the exact classrooms you select. Final student access still comes
                            from real classroom enrollment.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
            {selectedClassrooms.length > 0 ? (
                <div className="border-border/60 bg-muted/25 rounded-xl border p-4 text-sm">
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <div className="font-medium">
                            {selectedClassrooms.length} classroom
                            {selectedClassrooms.length === 1 ? '' : 's'} selected
                        </div>
                        {selectedClassrooms[0]?.subjectLabel ? (
                            <Badge variant="outline">{selectedClassrooms[0].subjectLabel}</Badge>
                        ) : null}
                    </div>
                    <div className="space-y-3">
                        {selectedClassrooms.map((classroom) => (
                            <div key={classroom.id} className="space-y-1">
                                <div className="font-medium">{classroom.title}</div>
                                <div className="text-muted-foreground">
                                    {[classroom.sectionLabel, classroom.termLabel]
                                        .filter(Boolean)
                                        .join(' • ')}
                                </div>
                                <div className="text-muted-foreground text-xs">
                                    {[classroom.departmentLabel, classroom.courseLabel]
                                        .filter(Boolean)
                                        .join(' • ')}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    );
}
