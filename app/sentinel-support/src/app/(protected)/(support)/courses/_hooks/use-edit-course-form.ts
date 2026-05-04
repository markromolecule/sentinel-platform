'use client';

import { useUpdateCourseMutation } from '@sentinel/hooks';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { courseSchema, type CourseFormValues } from '@sentinel/shared/schema';
import { Course } from '@sentinel/shared/types';
import { useEffect } from 'react';

export function useEditCourseForm(
    course: Course,
    institutionId: string,
    onSuccess: () => void,
) {
    const updateCourse = useUpdateCourseMutation({
        onSuccess: () => {
            onSuccess();
        },
    });

    const form = useForm<CourseFormValues>({
        resolver: zodResolver(courseSchema) as Resolver<CourseFormValues>,
        defaultValues: {
            code: course.code,
            title: course.title,
            department_id: course.departmentId ?? null,
            description: course.description ?? '',
        },
    });

    // Reset form when course changes
    useEffect(() => {
        form.reset({
            code: course.code,
            title: course.title,
            department_id: course.departmentId ?? null,
            description: course.description ?? '',
        });
    }, [course, form]);

    function onSubmit(values: CourseFormValues) {
        updateCourse.mutate({
            id: course.id,
            payload: {
                code: values.code,
                title: values.title,
                department_id: values.department_id,
                description: values.description,
                institution_id: institutionId,
            },
        });
    }

    return {
        form,
        onSubmit,
        isPending: updateCourse.isPending,
    };
}
