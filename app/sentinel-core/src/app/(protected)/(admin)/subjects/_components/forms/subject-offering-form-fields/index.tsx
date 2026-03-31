'use client';

import { type SubjectOfferingFormFieldsProps } from './_types';
import { OfferingDetailsSection } from './offering-details-section';
import { SelectionOverviewSection } from './selection-overview-section';
import { OfferingTargetPanels } from './offering-target-panels';
import { useSubjectOfferingFormData } from './_hooks/use-subject-offering-form-data';

export function SubjectOfferingFormFields({
    form,
    isPending,
    subjectToOffer,
}: SubjectOfferingFormFieldsProps) {
    const offeringFormData = useSubjectOfferingFormData({
        form,
        subjectToOffer,
    });

    return (
        <div className="grid gap-4 2xl:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.45fr)]">
            <div className="space-y-4">
                <OfferingDetailsSection
                    form={form}
                    isPending={isPending}
                    subjectToOffer={subjectToOffer}
                    subjects={offeringFormData.subjects}
                    semesters={offeringFormData.semesters}
                />

                <SelectionOverviewSection
                    selectedSubjectLabel={offeringFormData.selectedSubjectLabel}
                    selectedTermLabel={offeringFormData.selectedTermLabel}
                    selectedTermDates={offeringFormData.selectedTermDates}
                    selectedDepartments={offeringFormData.selectedDepartments}
                    selectedCourses={offeringFormData.selectedCourses}
                    selectedYearLevelLabels={offeringFormData.selectedYearLevelLabels}
                    selectedSections={offeringFormData.selectedSections}
                />
            </div>

            <OfferingTargetPanels
                form={form}
                isPending={isPending}
                filteredCoursesCount={offeringFormData.filteredCourses.length}
                departmentOptions={offeringFormData.departmentOptions}
                courseOptions={offeringFormData.courseOptions}
                yearLevelOptions={offeringFormData.yearLevelOptions}
                selectedDepartmentIds={offeringFormData.selectedDepartmentIds}
                selectedCourseIds={offeringFormData.selectedCourseIds}
                selectedYearLevels={offeringFormData.selectedYearLevels}
                departmentSummary={offeringFormData.departmentSummary}
                courseSummary={offeringFormData.courseSummary}
                yearLevelSummary={offeringFormData.yearLevelSummary}
                sectionSummary={offeringFormData.sectionSummary}
                onSetDepartmentIds={offeringFormData.setDepartmentIds}
                onSetCourseIds={offeringFormData.setCourseIds}
                onSetYearLevels={offeringFormData.setYearLevels}
                onToggleDepartment={offeringFormData.toggleDepartment}
                onToggleCourse={offeringFormData.toggleCourse}
                onToggleYearLevel={offeringFormData.toggleYearLevel}
            />
        </div>
    );
}
