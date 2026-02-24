'use client';

import { useForm } from 'react-hook-form';
import { useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { sectionSchema, type SectionFormValues } from '@sentinel/shared/schema';
import { useSectionStore } from '@/stores/use-section-store';
import { useCourseStore } from '@/stores/use-course-store';

export function useAddSectionForm(onSuccess: () => void) {
    const addSection = useSectionStore((state) => state.addSection);
    const courses = useCourseStore((state) => state.courses);

    const form = useForm<SectionFormValues>({
        resolver: zodResolver(sectionSchema),
        defaultValues: {
            courseId: '',
            name: '',
            department: '',
            yearLevel: '',
        },
    });

    const selectedDepartment = useWatch({
        control: form.control,
        name: 'department',
    });

    const filteredCourses = courses.filter(
        (course) => !selectedDepartment || course.department === selectedDepartment,
    );

    function onSubmit(values: SectionFormValues) {
        addSection(values);
        const course = courses.find((c) => c.id === values.courseId);
        toast.success(`Section ${values.name} added to ${course?.code ?? 'Course'}`);
        form.reset();
        onSuccess();
    }

    return {
        form,
        selectedDepartment,
        filteredCourses,
        onSubmit,
    };
}
