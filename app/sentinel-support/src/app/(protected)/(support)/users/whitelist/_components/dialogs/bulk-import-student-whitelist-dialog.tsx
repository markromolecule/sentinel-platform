'use client';

import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    ScrollArea,
} from '@sentinel/ui';
import { AlertCircle, CheckCircle2, FileSpreadsheet, Loader2 } from 'lucide-react';
import { cn } from '@sentinel/ui';
import { useBulkImportDialogState } from './bulk-import/hooks/use-bulk-import-dialog-state';
import { ScopeSelectors } from './bulk-import/components/scope-selectors';
import { DropZone } from './bulk-import/components/drop-zone';
import { FilePreview } from './bulk-import/components/file-preview';
import { IssuesList } from './bulk-import/components/issues-list';
import { PreviewTable } from './bulk-import/components/preview-table';
import { useActivePermissions } from '@sentinel/hooks';

const MAX_PREVIEW_ROWS_LIMIT = 100;

/**
 * Renders a dialog to bulk import student whitelist entries using Excel or CSV templates.
 * Coordinates with the modular `useBulkImportDialogState` hook and specialized sub-components.
 */
export function BulkImportStudentWhitelistDialog() {
    const { hasPermission } = useActivePermissions();
    const {
        open,
        isDragActive,
        institutionId,
        setInstitutionId,
        activeInstitutionId,
        lockedInstitutionName,
        canSelectInstitution,
        lockedDepartmentId,
        activeDepartmentId,
        setDepartmentId,
        availableDepartments,
        lockedCourseId,
        activeCourseId,
        setCourseId,
        availableCourses,
        isScopeReady,
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
        handleOpenChange,
        handleFileChange,
        handleImport,
        handleDragOver,
        handleDragLeave,
        handleDrop,
        resetState,
        institutions,
    } = useBulkImportDialogState();

    if (!hasPermission('student_whitelist:import')) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button>
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
                        and optional Status.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="relative z-0 min-h-0 flex-1 overflow-hidden">
                    <div className="space-y-4 px-6 pt-2 pb-6">
                        {/* 3-Column Scope Selector Inputs */}
                        <ScopeSelectors
                            canSelectInstitution={canSelectInstitution}
                            institutionId={institutionId}
                            setInstitutionId={setInstitutionId}
                            institutions={institutions}
                            lockedInstitutionName={lockedInstitutionName}
                            activeInstitutionId={activeInstitutionId}
                            lockedDepartmentId={lockedDepartmentId}
                            activeDepartmentId={activeDepartmentId}
                            setDepartmentId={setDepartmentId}
                            availableDepartments={availableDepartments}
                            lockedCourseId={lockedCourseId}
                            activeCourseId={activeCourseId}
                            setCourseId={setCourseId}
                            availableCourses={availableCourses}
                        />

                        {/* File Drop zone or Parsing / Preview section */}
                        {!file ? (
                            <DropZone
                                isScopeReady={isScopeReady}
                                isDragActive={isDragActive}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onFileChange={handleFileChange}
                            />
                        ) : (
                            <div className="flex flex-col space-y-4">
                                {/* Selected file details card */}
                                <FilePreview
                                    file={file}
                                    isImporting={isImporting}
                                    isParsing={isParsing}
                                    onReset={resetState}
                                />

                                {/* Parsed Results and preview grid */}
                                {!isParsing && parseResult && (
                                    <div className="flex flex-col gap-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            {/* Valid Imported/Ready Count Info Card */}
                                            <div className="flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 p-3">
                                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                                <span className="text-sm font-medium text-emerald-700">
                                                    {hasImportSummary
                                                        ? `${importSummary?.createdCount ?? 0} Imported`
                                                        : `${previewCount} Valid Rows`}
                                                </span>
                                            </div>

                                            {/* Issues / Skipped Rows Info Card */}
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

                                        {/* Import Summary Info Prompt */}
                                        {hasImportSummary && (
                                            <div className="text-muted-foreground rounded-md border border-[#323d8f]/15 bg-[#323d8f]/5 px-3 py-2 text-sm">
                                                Existing or invalid rows were skipped. Upload a
                                                corrected file if you want to retry those records.
                                            </div>
                                        )}

                                        {/* Parse validation warning list */}
                                        <IssuesList errors={visibleIssues} />

                                        {/* parsed CSV/Excel student preview grid */}
                                        <PreviewTable
                                            previewRows={previewRows}
                                            visiblePreviewRows={visiblePreviewRows}
                                            hiddenPreviewRowCount={hiddenPreviewRowCount}
                                            showsSourceCourse={showsSourceCourse}
                                            maxPreviewRowsCount={MAX_PREVIEW_ROWS_LIMIT}
                                        />
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
