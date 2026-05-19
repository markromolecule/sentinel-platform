'use client';

import { useState, type DragEvent, type ChangeEvent } from 'react';
import {
    useCoursesQuery,
    useDepartmentsQuery,
    useInstitutionsQuery,
    useStableValue,
} from '@sentinel/hooks';
import { useStudentWhitelistBulkImport } from '@/app/(protected)/(support)/users/whitelist/_hooks/use-student-whitelist-bulk-import';
import { useStudentWhitelistScope } from '@/app/(protected)/(support)/users/whitelist/_hooks/use-student-whitelist-scope';

const MAX_PREVIEW_ROWS = 100;

function getCourseDepartmentId(course: { departmentId?: string | null; department?: string }) {
    return course.departmentId || course.department || null;
}

/**
 * Custom hook to manage the local UI state, drag-and-drop operations,
 * scoping (institution, department, course selection), and data calculations
 * for the bulk import student whitelist dialog.
 *
 * @returns An object containing all the states, scopes, queries, file imports, and event handlers.
 */
export function useBulkImportDialogState() {
    const [open, setOpen] = useState(false);
    const [isDragActive, setIsDragActive] = useState(false);
    const [institutionId, setInstitutionId] = useState('');
    const [departmentId, setDepartmentId] = useState('');
    const [courseId, setCourseId] = useState('');

    const {
        isSuperadmin,
        lockedInstitutionId,
        lockedInstitutionName,
        lockedDepartmentId,
        lockedCourseId,
    } = useStudentWhitelistScope();

    const {
        file,
        parseResult,
        previewCount,
        importSummary,
        isParsing,
        isImporting,
        parseFile,
        importRows,
        resetState,
    } = useStudentWhitelistBulkImport();

    const activeInstitutionId = lockedInstitutionId || institutionId;
    const activeDepartmentId = lockedDepartmentId || departmentId;
    const activeCourseId = lockedCourseId || courseId;
    const canSelectInstitution = isSuperadmin && !lockedInstitutionId;

    const { data: institutions = [] } = useInstitutionsQuery();
    const { data: departments = [] } = useDepartmentsQuery({
        institutionId: activeInstitutionId || undefined,
    });
    const { data: courses = [] } = useCoursesQuery();

    const availableDepartments = useStableValue(
        () =>
            lockedDepartmentId
                ? departments.filter((department) => department.id === lockedDepartmentId)
                : departments,
        [departments, lockedDepartmentId],
    );

    const availableCourses = useStableValue(
        () =>
            courses.filter((course) => {
                const courseDepartmentId = getCourseDepartmentId(course);

                if (lockedCourseId) {
                    return course.id === lockedCourseId;
                }

                if (!activeDepartmentId) {
                    return false;
                }

                return courseDepartmentId === activeDepartmentId;
            }),
        [courses, lockedCourseId, activeDepartmentId],
    );

    const showsSourceCourse = useStableValue(
        () => parseResult?.rows.some((row) => Boolean(row.source_course)) ?? false,
        [parseResult],
    );

    const isScopeReady = Boolean(activeInstitutionId && activeDepartmentId && activeCourseId);
    const hasImportSummary = Boolean(importSummary);
    const visibleIssues = useStableValue(() => parseResult?.errors ?? [], [parseResult]);
    const previewRows = parseResult?.rows ?? [];
    const visiblePreviewRows = previewRows.slice(0, MAX_PREVIEW_ROWS);
    const hiddenPreviewRowCount = Math.max(previewRows.length - visiblePreviewRows.length, 0);

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) {
            resetState();
            setIsDragActive(false);
            if (!lockedInstitutionId) {
                setInstitutionId('');
            }
            if (!lockedDepartmentId) {
                setDepartmentId('');
            }
            if (!lockedCourseId) {
                setCourseId('');
            }
        }

        setOpen(nextOpen);
    };

    const handleSelectedFile = (selectedFile?: File | null) => {
        if (!selectedFile || !isScopeReady || isParsing || isImporting) {
            return;
        }

        parseFile(selectedFile);
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        handleSelectedFile(event.target.files?.[0]);
        event.target.value = '';
    };

    const handleImport = async () => {
        const didSucceed = await importRows({
            institution_id: activeInstitutionId,
            department_id: activeDepartmentId,
            course_id: activeCourseId,
        });

        if (didSucceed) {
            handleOpenChange(false);
        }
    };

    const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();

        if (!isScopeReady || isParsing || isImporting) {
            return;
        }

        setIsDragActive(true);
    };

    const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();

        if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
            return;
        }

        setIsDragActive(false);
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragActive(false);
        handleSelectedFile(event.dataTransfer.files?.[0]);
    };

    return {
        // State
        open,
        setOpen,
        isDragActive,
        setIsDragActive,
        institutionId,
        setInstitutionId,
        departmentId,
        setDepartmentId,
        courseId,
        setCourseId,

        // Scope Configs
        isSuperadmin,
        lockedInstitutionId,
        lockedInstitutionName,
        lockedDepartmentId,
        lockedCourseId,
        activeInstitutionId,
        activeDepartmentId,
        activeCourseId,
        canSelectInstitution,
        isScopeReady,

        // Data / Queries
        institutions,
        availableDepartments,
        availableCourses,

        // File State
        file,
        parseResult,
        previewCount,
        importSummary,
        isParsing,
        isImporting,
        showsSourceCourse,
        hasImportSummary,
        visibleIssues,
        previewRows,
        visiblePreviewRows,
        hiddenPreviewRowCount,

        // Actions / Handlers
        handleOpenChange,
        handleSelectedFile,
        handleFileChange,
        handleImport,
        handleDragOver,
        handleDragLeave,
        handleDrop,
        resetState,
    };
}
