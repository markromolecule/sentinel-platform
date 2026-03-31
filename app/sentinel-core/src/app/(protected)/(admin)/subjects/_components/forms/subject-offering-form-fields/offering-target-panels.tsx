import { type SubjectOfferingFormFieldsProps } from './_types';
import {
    CoursePickerField,
    DepartmentPickerField,
    SectionPickerField,
    YearLevelPickerField,
} from './target-pickers';

interface OfferingTargetPanelsProps {
    form: SubjectOfferingFormFieldsProps['form'];
    isPending: boolean;
    filteredCoursesCount: number;
    departmentOptions: Array<{ value: string; label: string }>;
    courseOptions: Array<{ value: string; label: string }>;
    yearLevelOptions: Array<{ value: string; label: string }>;
    selectedDepartmentIds: string[];
    selectedCourseIds: string[];
    selectedYearLevels: number[];
    departmentSummary: string;
    courseSummary: string;
    yearLevelSummary: string;
    sectionSummary: string;
    onSetDepartmentIds: (departmentIds: string[]) => void;
    onSetCourseIds: (courseIds: string[]) => void;
    onSetYearLevels: (yearLevels: number[]) => void;
    onToggleDepartment: (departmentId: string) => void;
    onToggleCourse: (courseId: string) => void;
    onToggleYearLevel: (yearLevel: number) => void;
}

export function OfferingTargetPanels({
    form,
    isPending,
    filteredCoursesCount,
    departmentOptions,
    courseOptions,
    yearLevelOptions,
    selectedDepartmentIds,
    selectedCourseIds,
    selectedYearLevels,
    departmentSummary,
    courseSummary,
    yearLevelSummary,
    sectionSummary,
    onSetDepartmentIds,
    onSetCourseIds,
    onSetYearLevels,
    onToggleDepartment,
    onToggleCourse,
    onToggleYearLevel,
}: OfferingTargetPanelsProps) {
    return (
        <div className="grid auto-rows-fr gap-3 md:grid-cols-2 2xl:grid-cols-4">
            <DepartmentPickerField
                form={form}
                isPending={isPending}
                departmentOptions={departmentOptions}
                selectedDepartmentIds={selectedDepartmentIds}
                departmentSummary={departmentSummary}
                visibleRows={11}
                onSetDepartmentIds={onSetDepartmentIds}
                onToggleDepartment={onToggleDepartment}
            />

            <CoursePickerField
                form={form}
                isPending={isPending}
                filteredCoursesCount={filteredCoursesCount}
                courseOptions={courseOptions}
                selectedCourseIds={selectedCourseIds}
                courseSummary={courseSummary}
                visibleRows={11}
                onSetCourseIds={onSetCourseIds}
                onToggleCourse={onToggleCourse}
            />

            <YearLevelPickerField
                form={form}
                isPending={isPending}
                yearLevelOptions={yearLevelOptions}
                selectedYearLevels={selectedYearLevels}
                yearLevelSummary={yearLevelSummary}
                visibleRows={11}
                onSetYearLevels={onSetYearLevels}
                onToggleYearLevel={onToggleYearLevel}
            />

            <SectionPickerField
                form={form}
                isPending={isPending}
                sectionSummary={sectionSummary}
                visibleRows={11}
            />
        </div>
    );
}
