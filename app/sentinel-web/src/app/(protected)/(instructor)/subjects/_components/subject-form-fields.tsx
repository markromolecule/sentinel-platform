import { useCoursesQuery, useDepartmentsQuery, useSectionsQuery, useSubjectsQuery } from "@sentinel/hooks";
import { useWatch } from 'react-hook-form';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@sentinel/ui';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@sentinel/ui';
import { FilterableCheckboxGroup } from '@/app/(protected)/(instructor)/subjects/_components/filterable-checkbox-group';

import { UseFormReturn } from 'react-hook-form';
import { type InstructorSubjectEnrollmentFormValues } from '@sentinel/shared/schema';

export function SubjectFormFields({ form }: { form: UseFormReturn<InstructorSubjectEnrollmentFormValues> }) {
    const { data: mainSubjects = [] } = useSubjectsQuery();
    const { data: allDepartments = [] } = useDepartmentsQuery();
    const { data: allCourses = [] } = useCoursesQuery();
    const { data: allSections = [] } = useSectionsQuery();

    const selectedSubjectCode = useWatch({
        control: form.control,
        name: 'subject_code',
    });

    const selectedDepartmentId = useWatch({
        control: form.control,
        name: 'department_id',
    });

    const selectedCourseId = useWatch({
        control: form.control,
        name: 'course_id',
    });

    const selectedYearLevel = useWatch({
        control: form.control,
        name: 'year_level',
    });

    const selectedSectionIds = useWatch({
        control: form.control,
        name: 'section_ids',
    });

    const activeSubject = mainSubjects.find(s => s.code === selectedSubjectCode);

    // Filter available downstream options by the selected Subject's configured arrays
    const validDepartments = allDepartments.filter(d => (activeSubject?.departmentIds ?? []).includes(d.id));
    const validCourses = allCourses.filter(c => (activeSubject?.courseIds ?? []).includes(c.id));
    const validYearLevels = activeSubject?.yearLevels ?? [];

    // Also filter Sections by the active Subject AND the selected department/course/year level
    const validSections = allSections.filter(section => {
        if (!(activeSubject?.sectionIds ?? []).includes(section.id)) return false;

        const matchesDepartment = !selectedDepartmentId || section.departmentId === selectedDepartmentId;
        const matchesCourse = !selectedCourseId || section.courseId === selectedCourseId;
        const matchesYear = !selectedYearLevel || section.yearLevel === Number(selectedYearLevel);

        return matchesDepartment && matchesCourse && matchesYear;
    });

    function toggleSection(sectionId: string) {
        const current = form.getValues('section_ids') ?? [];
        const next = current.includes(sectionId)
            ? current.filter((value: string) => value !== sectionId)
            : [...current, sectionId];

        form.setValue('section_ids', next, {
            shouldDirty: true,
            shouldValidate: true,
        });
    }

    return (
        <div className="grid gap-6">
            <FormField
                control={form.control}
                name="subject_code"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Master Subject</FormLabel>
                        <Select
                            onValueChange={(val) => {
                                field.onChange(val);
                                // Reset downstream fields upon subject change
                                form.setValue('department_id', '');
                                form.setValue('course_id', '');
                                form.setValue('year_level', 0);
                                form.setValue('section_ids', []);
                            }}
                            defaultValue={field.value}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a subject..." />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {mainSubjects.map(subject => (
                                    <SelectItem key={subject.code} value={subject.code}>
                                        {subject.code} - {subject.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {selectedSubjectCode && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-md bg-muted/20">
                    <FormField
                        control={form.control}
                        name="department_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Department</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Department" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {validDepartments.map(dept => (
                                            <SelectItem key={dept.id} value={dept.id}>
                                                {dept.code || dept.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="course_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Course</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Course" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {validCourses.map(course => (
                                            <SelectItem key={course.id} value={course.id}>
                                                {course.code || course.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="year_level"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Year Level</FormLabel>
                                <Select
                                    onValueChange={(val) => field.onChange(Number(val))}
                                    defaultValue={String(field.value || '')}
                                    value={String(field.value || '')}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Year Level" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {validYearLevels.map(year => (
                                            <SelectItem key={year} value={String(year)}>
                                                Year {year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            )}

            {selectedSubjectCode && selectedDepartmentId && selectedCourseId && selectedYearLevel > 0 && (
                <div className="pt-4 animate-in fade-in slide-in-from-top-4">
                    <FilterableCheckboxGroup
                        title="Available Sections"
                        searchPlaceholder="Filter sections..."
                        emptyMessage={
                            validSections.length === 0
                                ? 'No sections available for these properties.'
                                : 'No sections match your search.'
                        }
                        options={validSections.map((section) => ({
                            value: section.id,
                            label: section.name,
                        }))}
                        selectedValues={selectedSectionIds ?? []}
                        onToggle={toggleSection}
                        helperText="Calculated based on selected Department, Course, and Year Level configuration above."
                        visibleRows={4}
                    />
                </div>
            )}
        </div>
    );
}
