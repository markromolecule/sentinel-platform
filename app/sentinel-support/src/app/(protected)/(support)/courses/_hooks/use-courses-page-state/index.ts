'use client';

import {
    useCoursesQuery,
    useCreateCourseMutation,
    useDebounce,
    useDeleteCourseMutation,
    useDepartmentsQuery,
    useInstitutionsQuery,
    useUpdateCourseMutation,
} from '@sentinel/hooks';
import { Course } from '@sentinel/shared/types';
import { useMemo, useState } from 'react';
import { CourseFormState, EMPTY_COURSE_FORM } from './_types';

export function useCoursesPageState() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedInstitutionId, setSelectedInstitutionId] = useState('');
    const [formOpen, setFormOpen] = useState(false);
    const [form, setForm] = useState<CourseFormState>(EMPTY_COURSE_FORM);
    const [courseToRevert, setCourseToRevert] = useState<Course | null>(null);
    const [managedCourseId, setManagedCourseId] = useState<string | null>(null);

    const debouncedSearch = useDebounce(searchTerm, 500);

    const { data: institutions = [] } = useInstitutionsQuery();
    const selectedInstitution = institutions.find(
        (institution) => institution.id === selectedInstitutionId,
    );
    const parentInstitutionId = selectedInstitution?.parentInstitutionId ?? '';

    const {
        data: courses = [],
        isLoading,
        isError,
        error,
    } = useCoursesQuery(debouncedSearch, selectedInstitutionId || undefined);

    const { data: parentCourses = [] } = useCoursesQuery(
        '',
        parentInstitutionId || undefined,
        Boolean(parentInstitutionId),
    );

    const { data: departments = [] } = useDepartmentsQuery('', selectedInstitutionId || undefined);

    const createCourseMutation = useCreateCourseMutation({
        onSuccess: () => {
            setFormOpen(false);
            setForm(EMPTY_COURSE_FORM);
        },
    });

    const updateCourseMutation = useUpdateCourseMutation({
        onSuccess: () => {
            setFormOpen(false);
            setForm(EMPTY_COURSE_FORM);
        },
    });

    const deleteCourseMutation = useDeleteCourseMutation();

    const parentCourse = useMemo(
        () =>
            courseToRevert?.sourceRecordId
                ? parentCourses.find((course) => course.id === courseToRevert.sourceRecordId)
                : undefined,
        [courseToRevert, parentCourses],
    );

    const handleEdit = (course: Course) => {
        setForm({
            id: course.id,
            code: course.code,
            title: course.title,
            departmentId: course.departmentId ?? '',
            description: course.description ?? '',
            isInherited: course.isInherited,
        });
        setFormOpen(true);
    };

    const handleDelete = (course: Course) => {
        if (window.confirm(`Delete ${course.title}?`)) {
            deleteCourseMutation.mutate({
                id: course.id,
                institutionId: selectedInstitutionId || undefined,
            });
        }
    };

    const handleRevert = () => {
        if (!courseToRevert) return;
        deleteCourseMutation.mutate(
            {
                id: courseToRevert.id,
                institutionId: selectedInstitutionId || undefined,
            },
            {
                onSuccess: () => setCourseToRevert(null),
            },
        );
    };

    const submitForm = () => {
        if (!form.code.trim() || !form.title.trim()) return;

        if (form.id) {
            if (
                form.isInherited &&
                !window.confirm(
                    'This inherited course will become a local override for the selected branch context.',
                )
            ) {
                return;
            }

            updateCourseMutation.mutate({
                id: form.id,
                payload: {
                    code: form.code.trim(),
                    title: form.title.trim(),
                    department_id: form.departmentId || null,
                    description: form.description.trim() || null,
                    institution_id: selectedInstitutionId || undefined,
                },
            });
            return;
        }

        createCourseMutation.mutate({
            code: form.code.trim(),
            title: form.title.trim(),
            departmentId: form.departmentId || null,
            description: form.description.trim() || null,
            institution_id: selectedInstitutionId || undefined,
        });
    };

    return {
        searchTerm,
        setSearchTerm,
        selectedInstitutionId,
        setSelectedInstitutionId,
        formOpen,
        setFormOpen,
        form,
        setForm,
        courseToRevert,
        setCourseToRevert,
        managedCourseId,
        setManagedCourseId,
        institutions,
        courses,
        isLoading,
        isError,
        error,
        departments,
        parentCourse,
        handleEdit,
        handleDelete,
        handleRevert,
        submitForm,
        createCourseMutation,
        updateCourseMutation,
        deleteCourseMutation,
    };
}
