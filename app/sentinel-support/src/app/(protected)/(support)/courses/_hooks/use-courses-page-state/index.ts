'use client';

import {
    useCoursesQuery,
    useDebounce,
    useDeleteCourseMutation,
    useDepartmentsQuery,
    useInstitutionsQuery,
} from '@sentinel/hooks';
import { Course } from '@sentinel/shared/types';
import { useMemo, useState } from 'react';

export function useCoursesPageState() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedInstitutionId, setSelectedInstitutionId] = useState<string | undefined>('');
    const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [courseToRevert, setCourseToRevert] = useState<Course | null>(null);
    const [managedCourse, setManagedCourse] = useState<Course | null>(null);

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

    const deleteCourseMutation = useDeleteCourseMutation();

    const parentCourse = useMemo(
        () =>
            courseToRevert?.sourceRecordId
                ? parentCourses.find((course) => course.id === courseToRevert.sourceRecordId)
                : undefined,
        [courseToRevert, parentCourses],
    );

    const handleEdit = (course: Course) => {
        setCourseToEdit(course);
        setEditDialogOpen(true);
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

    return {
        searchTerm,
        setSearchTerm,
        selectedInstitutionId,
        setSelectedInstitutionId,
        courseToEdit,
        setCourseToEdit,
        editDialogOpen,
        setEditDialogOpen,
        courseToRevert,
        setCourseToRevert,
        managedCourse,
        setManagedCourse,
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
        deleteCourseMutation,
    };
}
