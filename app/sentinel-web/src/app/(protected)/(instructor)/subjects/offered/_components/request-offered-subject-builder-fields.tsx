'use client';

import type { SubjectOffering } from '@sentinel/shared/types';
import { Badge } from '@sentinel/ui';
import { FilterableCheckboxGroup } from '@/app/(protected)/(instructor)/subjects/_components/forms/filterable-checkbox-group';
import type { RequestOfferedSubjectBuilderFormValues } from '../_lib/request-offered-subject-builder-schema';
import { useRequestOfferedSubjectBuilder } from '../_hooks/use-request-offered-subject-builder';
import type { UseFormReturn } from 'react-hook-form';

interface RequestOfferedSubjectBuilderFieldsProps {
    form: UseFormReturn<RequestOfferedSubjectBuilderFormValues>;
    offering: SubjectOffering;
}

function RequestTargetPanel({
    title,
    options,
    selectedValues,
    onToggle,
    onToggleAll,
    searchPlaceholder,
    emptyMessage,
}: {
    title: string;
    options: Array<{ value: string; label: string }>;
    selectedValues: string[];
    onToggle: (value: string) => void;
    onToggleAll: (values: string[], checked: boolean) => void;
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
                onToggleAll={onToggleAll}
                visibleRows={12}
            />
        </div>
    );
}

export function RequestOfferedSubjectBuilderFields({
    form,
    offering,
}: RequestOfferedSubjectBuilderFieldsProps) {
    const builder = useRequestOfferedSubjectBuilder(form, offering);
    const selectedYearLevelValues = builder.selectedYearLevels.map(String);
    const classificationLabels = builder.classificationBadges.map((classification) => ({
        id: classification.id,
        label: classification.name,
        type: classification.type,
    }));

    return (
        <div className="space-y-4">
            {/* Minimal Header */}
            <div className="border-border/60 bg-muted/20 flex items-center justify-between rounded-xl border px-5 py-3">
                <div className="flex items-center gap-4">
                    <div>
                        <span className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                            Subject
                        </span>
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold">{offering.subjectCode}</h3>
                            <span className="text-muted-foreground text-sm">•</span>
                            <span className="text-sm font-medium">{offering.subjectTitle}</span>
                        </div>
                    </div>
                    <div className="bg-border/60 h-8 w-px" />
                    <div>
                        <span className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                            Term
                        </span>
                        <p className="text-sm font-medium">
                            {offering.termAcademicYear} • {offering.termSemester}
                        </p>
                    </div>
                </div>

                {classificationLabels.length > 0 && (
                    <div className="flex gap-2">
                        {classificationLabels.map((classification) => (
                            <Badge
                                key={classification.id}
                                variant={
                                    classification.type === 'GENERAL' ? 'default' : 'secondary'
                                }
                                className="h-5 px-2 text-[9px] font-bold uppercase"
                            >
                                {classification.label}
                            </Badge>
                        ))}
                    </div>
                )}
            </div>

            {/* Selection Grid - 4 Columns */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
                <RequestTargetPanel
                    title="Departments"
                    options={builder.departmentOptions}
                    selectedValues={builder.selectedDepartmentIds}
                    onToggle={builder.toggleDepartment}
                    onToggleAll={(values, checked) =>
                        builder.setDepartmentIds(
                            checked
                                ? Array.from(new Set([...builder.selectedDepartmentIds, ...values]))
                                : builder.selectedDepartmentIds.filter(
                                      (value) => !values.includes(value),
                                  ),
                        )
                    }
                    searchPlaceholder="Filter departments..."
                    emptyMessage="No departments available."
                />

                <RequestTargetPanel
                    title="Courses"
                    options={builder.courseOptions}
                    selectedValues={builder.selectedCourseIds}
                    onToggle={builder.toggleCourse}
                    onToggleAll={(values, checked) =>
                        builder.setCourseIds(
                            checked
                                ? Array.from(new Set([...builder.selectedCourseIds, ...values]))
                                : builder.selectedCourseIds.filter(
                                      (value) => !values.includes(value),
                                  ),
                        )
                    }
                    searchPlaceholder="Filter courses..."
                    emptyMessage="No courses available."
                />

                <RequestTargetPanel
                    title="Year Levels"
                    options={builder.yearLevelOptions}
                    selectedValues={selectedYearLevelValues}
                    onToggle={(value) => builder.toggleYearLevel(Number(value))}
                    onToggleAll={(values, checked) =>
                        builder.setYearLevels(
                            checked
                                ? Array.from(
                                      new Set([
                                          ...builder.selectedYearLevels,
                                          ...values.map((value) => Number(value)),
                                      ]),
                                  )
                                : builder.selectedYearLevels.filter(
                                      (value) => !values.includes(String(value)),
                                  ),
                        )
                    }
                    searchPlaceholder="Filter years..."
                    emptyMessage="No year levels available."
                />

                <RequestTargetPanel
                    title="Sections"
                    options={builder.sectionOptions}
                    selectedValues={builder.selectedSectionIds}
                    onToggle={builder.toggleSection}
                    onToggleAll={builder.toggleAllSections}
                    searchPlaceholder="Filter sections..."
                    emptyMessage="No sections match filters."
                />
            </div>
        </div>
    );
}
