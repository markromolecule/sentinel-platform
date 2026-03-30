import { UseFormReturn } from 'react-hook-form';
import { type InstructorSubjectEnrollmentFormValues } from '@sentinel/shared/schema';
import { FormField, FormItem, FormLabel, FormMessage, FormControl } from '@sentinel/ui';

import { useSubjectFormFiltering } from "@/app/(protected)/(instructor)/subjects/_hooks/use-subject-form-filtering";
import { SubjectSelector } from "@/app/(protected)/(instructor)/subjects/_components/forms/subject-selector";
import { SubjectMetadataFields } from "@/app/(protected)/(instructor)/subjects/_components/forms/subject-metadata-fields";
import { SectionSelector } from "@/app/(protected)/(instructor)/subjects/_components/forms/section-selector";

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
                        <FormControl>
                            <SubjectSelector
                                subjects={mainSubjects}
                                selectedSubjectCode={field.value}
                                onSelect={(val) => handleSubjectChange(val, field.onChange)}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <SubjectMetadataFields
                form={form}
                selectedSubjectCode={selectedSubjectCode}
                validDepartments={validDepartments}
                validCourses={validCourses}
                validYearLevels={validYearLevels}
            />

            {selectedSubjectCode && selectedDepartmentId && selectedCourseId && selectedYearLevel > 0 && (
                <SectionSelector
                    sections={validSections}
                    selectedSectionIds={selectedSectionIds}
                    onToggle={toggleSection}
                    onSelectAll={toggleAllSections}
                />
            )}
        </div>
    );
}
