'use client';

import { useUpdateCourseMutation } from '@/data';
import { useEffect } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { courseSchema, type CourseFormValues } from '@sentinel/shared/schema';
import { Course } from '@sentinel/shared/types';

/**
 * Custom hook to manage the form state, validation, updates, and submission for editing an existing course.
 *
 * @param course The course object to be edited.
 * @param onSuccess Callback function executed when the course is successfully updated.
 */
export function useEditCourseForm(course: Course, onSuccess: () => void) {
    const updateCourse = useUpdateCourseMutation({
        onSuccess: () => {
            form.reset();
            onSuccess();
        },
    });

    // Form instance
    const form = useForm<CourseFormValues>({
        resolver: zodResolver(courseSchema) as Resolver<CourseFormValues>,
        defaultValues: {
            code: course.code,
            title: course.title,
            department_id: (course.department as string) || undefined,
            description: course.description ?? undefined,
        },
    });

    // Reset when the course changes
    useEffect(() => {
        form.reset({
            code: course.code,
            title: course.title,
            department_id: (course.department as string) || undefined,
            description: course.description ?? undefined,
        });
    }, [course, form]);

    // Submit handler
    function onSubmit(values: CourseFormValues) {
        updateCourse.mutate({
            id: course.id,
            payload: values,
        });
    }

    return {
        form,
        onSubmit,
        isPending: updateCourse.isPending,
    };
}
