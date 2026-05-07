'use client';

import {
    useDebounce,
    useStableValue,
    useSubjectOfferingsQuery,
    useUpdateEnrollmentRequestMutation,
} from '@sentinel/hooks';
import {
    buildEnrollmentRequestFormValues,
    instructorSubjectRequestSchema,
    type EnrollmentRequest,
    type InstructorSubjectRequestValues,
    type SubjectOffering,
} from '@sentinel/shared';
import {
    Alert,
    AlertDescription,
    Badge,
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Form,
    Input,
} from '@sentinel/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, useWatch, type Resolver } from 'react-hook-form';
import { FilterableCheckboxGroup } from '@/app/(protected)/subjects/_components/forms/filterable-checkbox-group';

interface EditEnrollmentRequestDialogProps {
    request: EnrollmentRequest | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function canSubmitGroupedRequest(values: InstructorSubjectRequestValues) {
    return (
        values.section_ids.length > 0 ||
        (values.department_ids.length > 0 &&
            values.course_ids.length > 0 &&
            values.year_levels.length > 0)
    );
}

function buildInitialValues(request: EnrollmentRequest | null) {
    return buildEnrollmentRequestFormValues({
        subjectOfferingId: request?.subject_offering_id,
        departmentIds: request?.target_department_ids,
        courseIds: request?.target_course_ids,
        yearLevels: request?.target_year_levels,
        sectionIds: request?.sections
            .map((section) => section.section_id || section.class_group_id)
            .filter((value): value is string => Boolean(value)),
    });
}

function filterSections(args: {
    sections: SubjectOffering['sections'];
    departmentIds: string[];
    courseIds: string[];
    yearLevels: number[];
}) {
    return args.sections.filter((section) => {
        const matchesDepartment =
            args.departmentIds.length === 0 ||
            section.departmentId == null ||
            args.departmentIds.includes(section.departmentId);
        const matchesCourse =
            args.courseIds.length === 0 ||
            section.courseId == null ||
            args.courseIds.includes(section.courseId);
        const matchesYearLevel =
            args.yearLevels.length === 0 ||
            section.yearLevel == null ||
            args.yearLevels.includes(section.yearLevel);

        return matchesDepartment && matchesCourse && matchesYearLevel;
    });
}

function toLabelOptions(items: Array<{ id: string; label: string }>) {
    return items.sort((left, right) =>
        left.label.localeCompare(right.label, undefined, {
            numeric: true,
            sensitivity: 'base',
        }),
    );
}

function RequestTargetPanel({
    title,
    options,
    selectedValues,
    onToggle,
    onSetSelectedValues,
    searchPlaceholder,
    emptyMessage,
}: {
    title: string;
    options: Array<{ value: string; label: string }>;
    selectedValues: string[];
    onToggle: (value: string) => void;
    onSetSelectedValues: (values: string[]) => void;
    searchPlaceholder: string;
    emptyMessage: string;
}) {
    return (
        <div className="border-border/60 bg-background rounded-xl border p-4">
            <FilterableCheckboxGroup
                title={title}
                searchPlaceholder={searchPlaceholder}
                emptyMessage={emptyMessage}
                options={options}
                selectedValues={selectedValues}
                onToggle={onToggle}
                onSetSelectedValues={onSetSelectedValues}
                visibleRows={12}
            />
        </div>
    );
}

export function EditEnrollmentRequestDialog({
    request,
    open,
    onOpenChange,
}: EditEnrollmentRequestDialogProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);
    const { data: offerings = [], isLoading: isLoadingOfferings } = useSubjectOfferingsQuery({
        enabled: open,
        visibility: 'requestable',
        search: debouncedSearch,
    });
    const updateMutation = useUpdateEnrollmentRequestMutation();

    const form = useForm<InstructorSubjectRequestValues>({
        resolver: zodResolver(
            instructorSubjectRequestSchema,
        ) as Resolver<InstructorSubjectRequestValues>,
        defaultValues: buildInitialValues(request),
        mode: 'onChange',
    });

    const selectedOfferingId = useWatch({
        control: form.control,
        name: 'subject_offering_id',
    });
    const selectedDepartmentIds =
        useWatch({
            control: form.control,
            name: 'department_ids',
        }) ?? [];
    const selectedCourseIds =
        useWatch({
            control: form.control,
            name: 'course_ids',
        }) ?? [];
    const selectedYearLevels =
        useWatch({
            control: form.control,
            name: 'year_levels',
        }) ?? [];
    const selectedSectionIds =
        useWatch({
            control: form.control,
            name: 'section_ids',
        }) ?? [];

    const activeOffering = useStableValue(
        () => offerings.find((offering) => offering.id === selectedOfferingId) ?? null,
        [offerings, selectedOfferingId],
    );

    const departmentOptions = useStableValue(() => {
        if (!activeOffering) {
            return [];
        }

        return toLabelOptions(
            activeOffering.departments.map((department) => ({
                id: department.id,
                label: department.code?.trim() || department.name,
            })),
        ).map((department) => ({
            value: department.id,
            label: department.label,
        }));
    }, [activeOffering]);

    const visibleCourses = useStableValue(() => {
        if (!activeOffering) {
            return [];
        }

        if (selectedDepartmentIds.length === 0) {
            return activeOffering.courses;
        }

        const visibleCourseIds = new Set(
            activeOffering.sections
                .filter((section) =>
                    section.departmentId
                        ? selectedDepartmentIds.includes(section.departmentId)
                        : false,
                )
                .map((section) => section.courseId)
                .filter((courseId): courseId is string => Boolean(courseId)),
        );

        return activeOffering.courses.filter((course) => visibleCourseIds.has(course.id));
    }, [activeOffering, selectedDepartmentIds]);

    const courseOptions = useStableValue(
        () =>
            toLabelOptions(
                visibleCourses.map((course) => ({
                    id: course.id,
                    label: course.code?.trim() || course.title,
                })),
            ).map((course) => ({
                value: course.id,
                label: course.label,
            })),
        [visibleCourses],
    );

    const visibleSections = useStableValue(
        () =>
            activeOffering
                ? filterSections({
                      sections: activeOffering.sections,
                      departmentIds: selectedDepartmentIds,
                      courseIds: selectedCourseIds,
                      yearLevels: selectedYearLevels,
                  })
                : [],
        [activeOffering, selectedCourseIds, selectedDepartmentIds, selectedYearLevels],
    );

    const yearLevelOptions = useStableValue(() => {
        if (!activeOffering) {
            return [];
        }

        const availableYearLevels = Array.from(
            new Set(
                visibleSections
                    .map((section) => section.yearLevel)
                    .filter((yearLevel): yearLevel is number => typeof yearLevel === 'number'),
            ),
        ).sort((left, right) => left - right);

        const sourceYearLevels =
            availableYearLevels.length > 0 ? availableYearLevels : activeOffering.yearLevels;

        return sourceYearLevels.map((yearLevel) => ({
            value: String(yearLevel),
            label: `Year ${yearLevel}`,
        }));
    }, [activeOffering, visibleSections]);

    const sectionOptions = useStableValue(
        () =>
            visibleSections.map((section) => ({
                value: section.id,
                label: section.name,
            })),
        [visibleSections],
    );

    useEffect(() => {
        if (!open) {
            return;
        }

        form.reset(buildInitialValues(request));
        setSearchTerm('');
    }, [form, open, request]);

    useEffect(() => {
        const validCourseIds = new Set(visibleCourses.map((course) => course.id));
        const nextCourseIds = selectedCourseIds.filter((courseId) => validCourseIds.has(courseId));

        if (nextCourseIds.length !== selectedCourseIds.length) {
            form.setValue('course_ids', nextCourseIds, {
                shouldDirty: true,
                shouldValidate: true,
            });
        }
    }, [form, selectedCourseIds, visibleCourses]);

    useEffect(() => {
        const validYearLevels = new Set(yearLevelOptions.map((option) => Number(option.value)));
        const nextYearLevels = selectedYearLevels.filter((yearLevel) =>
            validYearLevels.has(yearLevel),
        );

        if (nextYearLevels.length !== selectedYearLevels.length) {
            form.setValue('year_levels', nextYearLevels, {
                shouldDirty: true,
                shouldValidate: true,
            });
        }
    }, [form, selectedYearLevels, yearLevelOptions]);

    useEffect(() => {
        const validSectionIds = new Set(visibleSections.map((section) => section.id));
        const nextSectionIds = selectedSectionIds.filter((sectionId) =>
            validSectionIds.has(sectionId),
        );

        if (nextSectionIds.length !== selectedSectionIds.length) {
            form.setValue('section_ids', nextSectionIds, {
                shouldDirty: true,
                shouldValidate: true,
            });
        }
    }, [form, selectedSectionIds, visibleSections]);

    if (!request) {
        return null;
    }

    const requestIds = request.sections.map((section) => section.request_id);

    const handleClose = () => {
        onOpenChange(false);
        form.reset(buildInitialValues(request));
    };

    const onSubmit = (values: InstructorSubjectRequestValues) => {
        updateMutation.mutate(
            {
                request_ids: requestIds,
                ...values,
            },
            {
                onSuccess: () => {
                    handleClose();
                },
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-[1400px]">
                <DialogHeader>
                    <DialogTitle>Edit Enrollment Request</DialogTitle>
                    <DialogDescription>
                        Update the request targets and re-submit the request for review. Saving
                        changes moves the request back to <strong>PENDING</strong>.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {!activeOffering ? (
                            <div className="space-y-4">
                                <div className="relative">
                                    <Search className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                                    <Input
                                        value={searchTerm}
                                        onChange={(event) => setSearchTerm(event.target.value)}
                                        placeholder="Search offered subjects by code or title..."
                                        className="pl-9"
                                    />
                                </div>

                                <div className="grid max-h-[420px] gap-3 overflow-y-auto pr-1">
                                    {isLoadingOfferings ? (
                                        <div className="border-border/60 bg-background flex h-[220px] items-center justify-center rounded-xl border">
                                            <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
                                        </div>
                                    ) : offerings.length > 0 ? (
                                        offerings.map((offering) => (
                                            <button
                                                key={offering.id}
                                                type="button"
                                                onClick={() =>
                                                    form.setValue(
                                                        'subject_offering_id',
                                                        offering.id,
                                                        {
                                                            shouldDirty: true,
                                                            shouldValidate: true,
                                                        },
                                                    )
                                                }
                                                className="border-border/60 hover:border-primary/40 hover:bg-muted/30 rounded-xl border px-4 py-3 text-left transition-colors"
                                            >
                                                <div className="flex items-center justify-between gap-3">
                                                    <div>
                                                        <p className="text-sm font-semibold">
                                                            {offering.subjectCode}
                                                        </p>
                                                        <p className="text-muted-foreground text-sm">
                                                            {offering.subjectTitle}
                                                        </p>
                                                    </div>
                                                    <Badge variant="secondary">
                                                        {offering.termSemester}
                                                    </Badge>
                                                </div>
                                                <p className="text-muted-foreground mt-2 text-xs">
                                                    {offering.termAcademicYear}
                                                </p>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="text-muted-foreground rounded-xl border border-dashed p-6 text-sm">
                                            No requestable offered subjects matched your search.
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-full"
                                        onClick={() =>
                                            form.setValue('subject_offering_id', '', {
                                                shouldDirty: true,
                                                shouldValidate: true,
                                            })
                                        }
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                    </Button>
                                    <div>
                                        <p className="text-sm font-semibold">
                                            {activeOffering.subjectCode}
                                        </p>
                                        <p className="text-muted-foreground text-sm">
                                            {activeOffering.subjectTitle}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
                                    <RequestTargetPanel
                                        title="Departments"
                                        options={departmentOptions}
                                        selectedValues={selectedDepartmentIds}
                                        onToggle={(value) => {
                                            const nextValues = selectedDepartmentIds.includes(value)
                                                ? selectedDepartmentIds.filter(
                                                      (currentValue) => currentValue !== value,
                                                  )
                                                : [...selectedDepartmentIds, value];
                                            form.setValue('department_ids', nextValues, {
                                                shouldDirty: true,
                                                shouldValidate: true,
                                            });
                                        }}
                                        onSetSelectedValues={(values) =>
                                            form.setValue('department_ids', values, {
                                                shouldDirty: true,
                                                shouldValidate: true,
                                            })
                                        }
                                        searchPlaceholder="Filter departments..."
                                        emptyMessage="No departments available."
                                    />

                                    <RequestTargetPanel
                                        title="Courses"
                                        options={courseOptions}
                                        selectedValues={selectedCourseIds}
                                        onToggle={(value) => {
                                            const nextValues = selectedCourseIds.includes(value)
                                                ? selectedCourseIds.filter(
                                                      (currentValue) => currentValue !== value,
                                                  )
                                                : [...selectedCourseIds, value];
                                            form.setValue('course_ids', nextValues, {
                                                shouldDirty: true,
                                                shouldValidate: true,
                                            });
                                        }}
                                        onSetSelectedValues={(values) =>
                                            form.setValue('course_ids', values, {
                                                shouldDirty: true,
                                                shouldValidate: true,
                                            })
                                        }
                                        searchPlaceholder="Filter courses..."
                                        emptyMessage="No courses available."
                                    />

                                    <RequestTargetPanel
                                        title="Year Levels"
                                        options={yearLevelOptions}
                                        selectedValues={selectedYearLevels.map(String)}
                                        onToggle={(value) => {
                                            const yearLevel = Number(value);
                                            const nextValues = selectedYearLevels.includes(
                                                yearLevel,
                                            )
                                                ? selectedYearLevels.filter(
                                                      (currentValue) => currentValue !== yearLevel,
                                                  )
                                                : [...selectedYearLevels, yearLevel];
                                            form.setValue('year_levels', nextValues, {
                                                shouldDirty: true,
                                                shouldValidate: true,
                                            });
                                        }}
                                        onSetSelectedValues={(values) =>
                                            form.setValue(
                                                'year_levels',
                                                values.map((value) => Number(value)),
                                                {
                                                    shouldDirty: true,
                                                    shouldValidate: true,
                                                },
                                            )
                                        }
                                        searchPlaceholder="Filter year levels..."
                                        emptyMessage="No year levels available."
                                    />

                                    <RequestTargetPanel
                                        title="Sections"
                                        options={sectionOptions}
                                        selectedValues={selectedSectionIds}
                                        onToggle={(value) => {
                                            const nextValues = selectedSectionIds.includes(value)
                                                ? selectedSectionIds.filter(
                                                      (currentValue) => currentValue !== value,
                                                  )
                                                : [...selectedSectionIds, value];
                                            form.setValue('section_ids', nextValues, {
                                                shouldDirty: true,
                                                shouldValidate: true,
                                            });
                                        }}
                                        onSetSelectedValues={(values) =>
                                            form.setValue('section_ids', values, {
                                                shouldDirty: true,
                                                shouldValidate: true,
                                            })
                                        }
                                        searchPlaceholder="Filter sections..."
                                        emptyMessage="No sections match the selected filters."
                                    />
                                </div>
                            </div>
                        )}

                        {form.formState.errors.section_ids?.message ? (
                            <Alert variant="destructive">
                                <AlertDescription>
                                    {form.formState.errors.section_ids.message}
                                </AlertDescription>
                            </Alert>
                        ) : null}

                        <DialogFooter className="border-border/60 bg-background sticky bottom-0 rounded-xl border px-4 py-3">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={updateMutation.isPending}
                                onClick={handleClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={
                                    updateMutation.isPending ||
                                    !activeOffering ||
                                    !canSubmitGroupedRequest(form.getValues())
                                }
                            >
                                {updateMutation.isPending
                                    ? 'Saving Changes...'
                                    : 'Save Request Changes'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
