import { useCoursesQuery, useDepartmentsQuery, useSectionsQuery, useSubjectsQuery } from "@sentinel/hooks";
import { useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { instructorSubjectEnrollmentSchema, type InstructorSubjectEnrollmentFormValues } from '@sentinel/shared/schema';
import { type UseAddSubjectFormReturn } from './_types';
import { EMPTY_INSTRUCTOR_SUBJECT_FORM_VALUES } from '@/app/(protected)/(instructor)/subjects/_hooks/instructor-subject-form-values';
import { useSubjectStore } from '@/stores/use-subject-store';
import { toast } from 'sonner';
import { MOCK_PROCTOR } from '@sentinel/shared/constants';

export function useAddSubjectForm(): UseAddSubjectFormReturn {
    const [open, setOpen] = useState(false);
    
    // Fetch master subjects to match selected subject title
    const { data: masterSubjects = [] } = useSubjectsQuery();
    // Fetch sections to get real section names dynamically
    const { data: allSections = [] } = useSectionsQuery();
    const { data: allDepartments = [] } = useDepartmentsQuery();
    const { data: allCourses = [] } = useCoursesQuery();

    const addSubject = useSubjectStore((state) => state.addSubject);

    const form = useForm<InstructorSubjectEnrollmentFormValues>({
        resolver: zodResolver(instructorSubjectEnrollmentSchema) as Resolver<InstructorSubjectEnrollmentFormValues>,
        defaultValues: EMPTY_INSTRUCTOR_SUBJECT_FORM_VALUES,
    });

    function onSubmit(values: InstructorSubjectEnrollmentFormValues) {
        const selectedSubject = masterSubjects.find(s => s.code === values.subject_code);
        if (!selectedSubject) {
             toast.error("Selected subject not found");
             return;
        }

        const sectionNames = values.section_ids.map(id => {
            return allSections.find(s => s.id === id)?.name || "Unknown Section";
        });
        
        const deptObj = (masterSubjects.find(s => s.code === selectedSubject.code)?.departmentIds ?? []).includes(values.department_id) ? allDepartments.find(d => d.id === values.department_id)?.name || values.department_id : values.department_id; 
        const courseObj = allCourses.find(c => c.id === values.course_id)?.code || values.course_id;

        addSubject({
             title: selectedSubject.title,
             code: selectedSubject.code,
             section: sectionNames.join(', '), // fallback for old column
             sections: sectionNames,
             department: deptObj,
             departments: [deptObj],
             courses: courseObj ? [courseObj] : undefined,
             yearLevelsNumeric: [values.year_level],
             instructorId: MOCK_PROCTOR.id,
             createdBy: MOCK_PROCTOR.name,
        });

        toast.success("Enrolled completely!");
        form.reset(EMPTY_INSTRUCTOR_SUBJECT_FORM_VALUES);
        setOpen(false);
    }

    return {
        form,
        onSubmit,
        isPending: false,
        open,
        setOpen,
    };
}
