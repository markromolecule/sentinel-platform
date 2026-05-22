'use client';

import { useCreateCourseMutation } from '@/data';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { courseSchema, type CourseFormValues } from '@sentinel/shared/schema';

/**
 * Custom hook to manage the form state, validation, and submission for adding a new course.
 *
 * @param onSuccess Callback function executed when the course is successfully created.
 */
export function useAddCourseForm(onSuccess: () => void) {
    const createCourse = useCreateCourseMutation({
        onSuccess: () => {
            form.reset();
            onSuccess();
        },
    });

    // Form instance
    const form = useForm<CourseFormValues>({
        resolver: zodResolver(courseSchema) as Resolver<CourseFormValues>,
        defaultValues: {
            code: '',
            title: '',
            department_id: null,
            description: '',
        },
    });

    // Submit handler
    function onSubmit(values: CourseFormValues) {
        createCourse.mutate({
            code: values.code || null,
            title: values.title,
            departmentId: values.department_id ?? null,
            description: values.description ?? null,
        });
    }

    return {
        form,
        onSubmit,
        isPending: createCourse.isPending,
    };
}
