'use client';

import { useState, type DragEvent } from 'react';
import {
    useCoursesQuery,
    useDepartmentsQuery,
    useInstitutionsQuery,
    useStableValue,
} from '@sentinel/hooks';
import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    Input,
    ScrollArea,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@sentinel/ui';
import { AlertCircle, CheckCircle2, FileSpreadsheet, Loader2, Upload, X } from 'lucide-react';
import { cn } from '@sentinel/ui';
import { useStudentWhitelistBulkImport } from '@/app/(protected)/(support)/users/whitelist/_hooks/use-student-whitelist-bulk-import';
import { useStudentWhitelistScope } from '@/app/(protected)/(support)/users/whitelist/_hooks/use-student-whitelist-scope';

const MAX_PREVIEW_ROWS = 100;

function getCourseDepartmentId(course: { departmentId?: string | null; department?: string }) {
    return course.departmentId || course.department || null;
}

/**
 * Renders a dialog to bulk import student whitelist entries using Excel or CSV templates.
 */
export function BulkImportStudentWhitelistDialog() {
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

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="border-[#323d8f] text-[#323d8f] hover:bg-[#323d8f]/5"
                >
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Bulk Import
                </Button>
            </DialogTrigger>
            <DialogContent className="flex h-[90vh] max-h-[760px] flex-col overflow-hidden p-0 sm:max-w-[680px]">
                <DialogHeader className="shrink-0 p-6 pb-2">
                    <DialogTitle>Bulk Import Student Whitelist</DialogTitle>
                    <DialogDescription>
                        Upload a CSV or Excel file using either direct whitelist columns or a
                        registrar-style masterlist with Student ID, Student Name, optional Course,
                        and optional Status. The selected institution, department, and course will
                        be applied to every imported row.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="relative z-0 min-h-0 flex-1 overflow-hidden">
                    <div className="space-y-4 px-6 pt-2 pb-6">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Institution</p>
                                {canSelectInstitution ? (
                                    <Select
                                        value={institutionId}
                                        onValueChange={(value) => {
                                            setInstitutionId(value);
                                            if (!lockedDepartmentId) {
                                                setDepartmentId('');
                                            }
                                            if (!lockedCourseId) {
                                                setCourseId('');
                                            }
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select institution" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {institutions.map((institution) => (
                                                <SelectItem
                                                    key={institution.id}
                                                    value={institution.id}
                                                 >
                                                    {institution.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Input
                                        value={lockedInstitutionName || 'Loading institution...'}
                                        readOnly
                                        disabled
                                        className="bg-muted text-muted-foreground"
                                    />
                                )}
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-medium">Department</p>
                                <Select
                                    value={activeDepartmentId}
                                    onValueChange={(value) => {
                                        if (!lockedDepartmentId) {
                                            setDepartmentId(value);
                                        }
                                        if (!lockedCourseId) {
                                            setCourseId('');
                                        }
                                    }}
                                    disabled={!!lockedDepartmentId || !activeInstitutionId}
                                >
                                    <SelectTrigger>
                                        <SelectValue
                                            placeholder={
                                                activeInstitutionId
                                                    ? 'Select department'
                                                    : 'Select institution first'
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableDepartments.map((department) => (
                                            <SelectItem key={department.id} value={department.id}>
                                                {department.code || department.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-medium">Course</p>
                                <Select
                                    value={activeCourseId}
                                    onValueChange={(value) => {
                                        if (!lockedCourseId) {
                                            setCourseId(value);
                                        }
                                    }}
                                    disabled={!!lockedCourseId || !activeDepartmentId}
                                >
                                    <SelectTrigger>
                                        <SelectValue
                                            placeholder={
                                                activeDepartmentId
                                                    ? 'Select course'
                                                    : 'Select department first'
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableCourses.map((course) => (
                                            <SelectItem key={course.id} value={course.id}>
                                                {course.code || course.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {!file ? (
                            <div
                                className={cn(
                                    'border-border bg-muted/30 rounded-xl border-2 border-dashed p-12 text-center transition-colors',
                                    isScopeReady && 'hover:border-[#323d8f]/50',
                                    isDragActive && 'border-[#323d8f] bg-[#323d8f]/5',
                                )}
                                onDragOver={handleDragOver}
                                onDragEnter={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <div className="flex flex-col items-center gap-4">
                                    <div className="bg-background border-border rounded-full border p-4 shadow-sm">
                                        <Upload className="h-8 w-8 text-[#323d8f]" />
                                    </div>
                                    <div>
                                        <p className="text-foreground text-sm font-medium">
                                            Click to browse or drag and drop
                                        </p>
                                        <p className="text-muted-foreground mt-1 text-xs">
                                            CSV, XLSX, or XLS files allowed
                                        </p>
                                    </div>
                                    <input
                                        type="file"
                                        accept=".csv,.xlsx,.xls"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="student-whitelist-bulk-upload"
                                        disabled={!isScopeReady}
                                    />
                                    <Button
                                        asChild
                                        size="sm"
                                        className="bg-[#323d8f] hover:bg-[#323d8f]/90"
                                        disabled={!isScopeReady}
                                    >
                                        <label
                                            htmlFor="student-whitelist-bulk-upload"
                                            className={cn(
                                                'cursor-pointer',
                                                !isScopeReady && 'cursor-not-allowed',
                                            )}
                                        >
                                            Select File
                                        </label>
                                    </Button>
                                    {!isScopeReady && (
                                        <p className="text-muted-foreground text-xs">
                                            Select the whitelist scope before uploading a file.
                                        </p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col space-y-4">
                                <div className="flex items-center justify-between rounded-lg border border-[#323d8f]/20 bg-[#323d8f]/5 p-3">
                                    <div className="flex items-center gap-3">
                                        <FileSpreadsheet className="h-5 w-5 text-[#323d8f]" />
                                        <div>
                                            <p className="text-foreground max-w-[300px] truncate text-sm font-medium">
                                                {file.name}
                                            </p>
                                            <p className="text-muted-foreground text-xs">
                                                {(file.size / 1024).toFixed(1)} KB
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={resetState}
                                        disabled={isImporting}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>

                                {isParsing && (
                                    <div className="text-muted-foreground flex flex-col items-center justify-center gap-3 py-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-[#323d8f]" />
                                        <p className="text-sm">Analyzing file content...</p>
                                    </div>
                                )}

                                {!isParsing && parseResult && (
                                    <div className="flex flex-col gap-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 p-3">
                                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                                <span className="text-sm font-medium text-emerald-700">
                                                    {hasImportSummary
                                                        ? `${importSummary?.createdCount ?? 0} Imported`
                                                        : `${previewCount} Valid Rows`}
                                                </span>
                                            </div>
                                            <div
                                                className={cn(
                                                    'flex items-center gap-2 rounded-lg border p-3',
                                                    visibleIssues.length > 0
                                                        ? 'border-amber-100 bg-amber-50'
                                                        : 'bg-muted border-border',
                                                )}
                                            >
                                                <AlertCircle
                                                    className={cn(
                                                        'h-4 w-4',
                                                        visibleIssues.length > 0
                                                            ? 'text-amber-600'
                                                            : 'text-muted-foreground',
                                                    )}
                                                />
                                                <span
                                                    className={cn(
                                                        'text-sm font-medium',
                                                        visibleIssues.length > 0
                                                            ? 'text-amber-700'
                                                            : 'text-muted-foreground',
                                                    )}
                                                >
                                                    {hasImportSummary
                                                        ? `${importSummary?.failedCount ?? 0} Skipped`
                                                        : `${visibleIssues.length} Issues Found`}
                                                </span>
                                            </div>
                                        </div>

                                        {hasImportSummary && (
                                            <div className="text-muted-foreground rounded-md border border-[#323d8f]/15 bg-[#323d8f]/5 px-3 py-2 text-sm">
                                                Existing or invalid rows were skipped. Upload a
                                                corrected file if you want to retry those records.
                                            </div>
                                        )}

                                        {visibleIssues.length > 0 && (
                                            <ScrollArea className="h-[140px] rounded-md border bg-amber-50/30 p-2">
                                                <ul className="space-y-1">
                                                    {visibleIssues.map((error, index) => (
                                                        <li
                                                            key={index}
                                                            className="flex items-start gap-2 text-xs text-amber-600"
                                                        >
                                                            <span className="mt-0.5">•</span>
                                                            {error}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </ScrollArea>
                                        )}

                                        {previewRows.length > 0 && (
                                            <div className="min-h-0 overflow-hidden rounded-lg border">
                                                <div className="bg-muted border-b px-4 py-2">
                                                    <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                                                        Rows Ready To Import
                                                    </p>
                                                </div>
                                                <ScrollArea className="h-[260px]">
                                                    <table className="w-full text-left text-xs">
                                                        <thead className="bg-background sticky top-0 z-10 border-b">
                                                            <tr>
                                                                <th className="bg-muted/50 px-4 py-2 font-medium">
                                                                    Student Number
                                                                </th>
                                                                <th className="bg-muted/50 px-4 py-2 font-medium">
                                                                    Last Name
                                                                </th>
                                                                <th className="bg-muted/50 px-4 py-2 font-medium">
                                                                    First Name
                                                                </th>
                                                                {showsSourceCourse && (
                                                                    <th className="bg-muted/50 px-4 py-2 font-medium">
                                                                        Source Course
                                                                    </th>
                                                                )}
                                                                <th className="bg-muted/50 px-4 py-2 font-medium">
                                                                    Status
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y">
                                                            {visiblePreviewRows.map(
                                                                (row, index) => (
                                                                    <tr
                                                                        key={`${row.student_number}-${index}`}
                                                                        className="hover:bg-muted/50 transition-colors"
                                                                    >
                                                                        <td className="px-4 py-2 font-mono">
                                                                            {row.student_number}
                                                                        </td>
                                                                        <td className="px-4 py-2 font-medium">
                                                                            {row.last_name}
                                                                        </td>
                                                                        <td className="px-4 py-2">
                                                                            {row.first_name || '—'}
                                                                        </td>
                                                                        {showsSourceCourse && (
                                                                            <td className="px-4 py-2">
                                                                                {row.source_course ||
                                                                                    '—'}
                                                                            </td>
                                                                        )}
                                                                        <td className="px-4 py-2">
                                                                            {row.status}
                                                                        </td>
                                                                    </tr>
                                                                ),
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </ScrollArea>
                                                {hiddenPreviewRowCount > 0 && (
                                                    <div className="bg-muted/40 text-muted-foreground border-t px-4 py-2 text-xs">
                                                        Showing the first {MAX_PREVIEW_ROWS} of{' '}
                                                        {previewRows.length} valid rows. All rows
                                                        will still be imported.
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <DialogFooter className="bg-background relative z-20 shrink-0 border-t p-6 pt-4">
                    <Button
                        variant="ghost"
                        onClick={() => handleOpenChange(false)}
                        disabled={isImporting}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleImport}
                        disabled={
                            !isScopeReady ||
                            !parseResult?.rows.length ||
                            isImporting ||
                            hasImportSummary
                        }
                        className="min-w-[140px] bg-[#323d8f] hover:bg-[#323d8f]/90"
                    >
                        {isImporting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Importing...
                            </>
                        ) : (
                            <>Import {previewCount} Entries</>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
