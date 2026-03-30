import { useSubjectFormFiltering } from "../_hooks/use-subject-form-filtering";
import {
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
import { FilterableCheckboxGroup } from '@/app/(protected)/(instructor)/subjects/_components/filterable-checkbox-group';
import { UseFormReturn } from 'react-hook-form';
import { type InstructorSubjectEnrollmentFormValues } from '@sentinel/shared/schema';

export function SubjectFormFields({ form }: { form: UseFormReturn<InstructorSubjectEnrollmentFormValues> }) {
    const {
        mainSubjects,
        validDepartments,
        validCourses,
        validYearLevels,
        validSections,
        selectedSubjectCode,
        selectedDepartmentId,
        selectedCourseId,
        selectedYearLevel,
        selectedSectionIds,
        toggleSection,
        toggleAllSections,
        handleSubjectChange,
    } = useSubjectFormFiltering(form);

    return (
        <div className="grid gap-6">
            <FormField
                control={form.control}
                name="subject_code"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Master Subject</FormLabel>
                        <Select
                            onValueChange={(val) => handleSubjectChange(val, field.onChange)}
                            defaultValue={field.value}
                            value={field.value}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a subject..." />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-[300px]">
                                {mainSubjects.map((subject) => (
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-md bg-muted/20 animate-in fade-in zoom-in-95 duration-200">
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
                                        {validDepartments.map((dept) => (
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
                                        {validCourses.map((course) => (
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
                                        {validYearLevels.map((year) => (
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
                <div className="pt-4 animate-in fade-in slide-in-from-top-4 duration-300">
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
                        selectedValues={selectedSectionIds}
                        onToggle={toggleSection}
                        onToggleAll={toggleAllSections}
                        helperText="Calculated based on selected Department, Course, and Year Level configuration above."
                        visibleRows={4}
                    />
                </div>
            )}
        </div>
    );
}
