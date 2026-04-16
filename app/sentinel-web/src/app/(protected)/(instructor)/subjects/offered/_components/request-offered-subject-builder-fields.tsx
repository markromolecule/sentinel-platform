'use client';

import { format } from 'date-fns';
import type { SubjectOffering } from '@sentinel/shared/types';
import { Badge } from '@sentinel/ui';
import { StatusBadge } from '@/components/common/displays/status-badge';
import { FilterableCheckboxGroup } from '@/app/(protected)/(instructor)/subjects/_components/forms/filterable-checkbox-group';
import type { RequestOfferedSubjectBuilderFormValues } from '../_lib/request-offered-subject-builder-schema';
import { useRequestOfferedSubjectBuilder } from '../_hooks/use-request-offered-subject-builder';
import type { UseFormReturn } from 'react-hook-form';
import { RequestOfferedSubjectBuilderSelectionPreview } from './request-offered-subject-builder-selection-preview';
import { RequestOfferedSubjectBuilderSummaryStat } from './request-offered-subject-builder-summary-stat';

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
                visibleRows={11}
            />
        </div>
    );
}

function formatTermDate(date?: Date | string | null) {
    if (!date) {
        return 'TBD';
    }

    return format(new Date(date), 'MMM d, yyyy');
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
    const scopeGuidance = builder.isGeneralOffering
        ? 'This general subject can span multiple departments and courses. Choose the audiences you need, and the request will stay limited to the offering scope.'
        : 'This core subject keeps a tighter request flow. Your available choices are still limited by the sections attached to this offering.';

    return (
        <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
            <div className="space-y-4">
                <div className="border-border/60 bg-background rounded-xl border p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1">
                            <p className="text-muted-foreground text-xs font-semibold tracking-[0.08em] uppercase">
                                Offered Subject
                            </p>
                            <h3 className="text-foreground text-lg font-semibold">
                                {offering.subjectCode}
                            </h3>
                            <p className="text-muted-foreground text-sm leading-6">
                                {offering.subjectTitle}
                            </p>
                        </div>
                        <StatusBadge status={offering.status} />
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                        <RequestOfferedSubjectBuilderSummaryStat
                            label="Term"
                            value={`${offering.termAcademicYear} ${offering.termSemester}`}
                            tone="accent"
                        />
                        <RequestOfferedSubjectBuilderSummaryStat
                            label="Schedule"
                            value={`${formatTermDate(offering.termStartDate)} - ${formatTermDate(offering.termEndDate)}`}
                        />
                        <RequestOfferedSubjectBuilderSummaryStat
                            label="Available Sections"
                            value={`${builder.visibleSectionCount} visible of ${builder.allowedSectionCount}`}
                        />
                    </div>

                    {classificationLabels.length > 0 ? (
                        <div className="mt-4">
                            <p className="text-muted-foreground text-xs font-semibold tracking-[0.08em] uppercase">
                                Classifications
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {classificationLabels.map((classification) => (
                                    <Badge
                                        key={classification.id}
                                        variant={
                                            classification.type === 'GENERAL'
                                                ? 'default'
                                                : 'secondary'
                                        }
                                        className="h-6 px-2.5 text-[11px] font-semibold"
                                    >
                                        {classification.label}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    ) : null}

                    <div className="bg-muted/40 mt-4 rounded-xl p-3">
                        <p className="text-foreground text-sm font-semibold">Request guidance</p>
                        <p className="text-muted-foreground mt-1 text-sm leading-6">
                            {scopeGuidance}
                        </p>
                    </div>
                </div>

                <div className="border-border/60 bg-background rounded-xl border p-4">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-foreground text-sm font-semibold">
                                Request overview
                            </p>
                            <p className="text-muted-foreground mt-1 text-sm leading-6">
                                {builder.groupedRequestPreviewText}
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {builder.targetCountBadges.map((badge, index) => (
                            <RequestOfferedSubjectBuilderSummaryStat
                                key={badge.key}
                                label={badge.label}
                                value={badge.value}
                                tone={index === 3 ? 'accent' : 'neutral'}
                            />
                        ))}
                    </div>

                    <div className="mt-4 space-y-3">
                        <RequestOfferedSubjectBuilderSelectionPreview
                            title="Departments"
                            items={builder.selectedDepartmentLabels}
                            emptyLabel={builder.departmentSummary}
                        />
                        <RequestOfferedSubjectBuilderSelectionPreview
                            title="Courses"
                            items={builder.selectedCourseLabels}
                            emptyLabel={builder.courseSummary}
                        />
                        <RequestOfferedSubjectBuilderSelectionPreview
                            title="Year Levels"
                            items={builder.selectedYearLevelLabels}
                            emptyLabel={builder.yearLevelSummary}
                        />
                        <RequestOfferedSubjectBuilderSelectionPreview
                            title="Sections"
                            items={builder.selectedSectionLabels}
                            emptyLabel={builder.sectionSummary}
                            accent={builder.selectedSectionIds.length > 0}
                        />
                    </div>
                </div>
            </div>

            <div className="grid auto-rows-fr gap-4 md:grid-cols-2">
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
                    searchPlaceholder="Filter department codes..."
                    emptyMessage="No departments are available for this offering."
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
                    searchPlaceholder="Filter course codes..."
                    emptyMessage="No courses are available for this offering."
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
                    searchPlaceholder="Filter year levels..."
                    emptyMessage="No year levels are available for this offering."
                />

                <RequestTargetPanel
                    title="Sections"
                    options={builder.sectionOptions}
                    selectedValues={builder.selectedSectionIds}
                    onToggle={builder.toggleSection}
                    onToggleAll={builder.toggleAllSections}
                    searchPlaceholder="Filter section codes..."
                    emptyMessage="No sections match the current filters."
                />
            </div>
        </div>
    );
}
