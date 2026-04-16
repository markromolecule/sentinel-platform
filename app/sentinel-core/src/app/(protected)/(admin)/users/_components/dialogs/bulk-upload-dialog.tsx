'use client';

import { useState } from 'react';
import { Button } from '@sentinel/ui';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@sentinel/ui';
import { Upload, FileSpreadsheet, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@sentinel/ui';
import { useBulkUpload } from '@/app/(protected)/(admin)/users/_hooks/use-bulk-upload';
import { ScrollArea } from '@sentinel/ui';

export function BulkUploadDialog() {
    const [open, setOpen] = useState(false);
    const { file, parseResult, isParsing, isImporting, parseFile, importUsers, resetState } =
        useBulkUpload();

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            resetState();
        }
        setOpen(newOpen);
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            parseFile(selectedFile);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="border-[#323d8f] text-[#323d8f] hover:bg-[#323d8f]/5"
                >
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Bulk Upload
                </Button>
            </DialogTrigger>
            <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden p-0 sm:max-w-[600px]">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle>Bulk Upload Users</DialogTitle>
                    <DialogDescription>
                        Upload a CSV or Excel file containing user information. Required fields:
                        First Name, Last Name, StudentID, Course.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden px-6 pt-2 pb-6">
                    {!file ? (
                        <div className="border-border bg-muted/30 rounded-xl border-2 border-dashed p-12 text-center transition-colors hover:border-[#323d8f]/50">
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
                                    onChange={onFileChange}
                                    className="hidden"
                                    id="bulk-file-upload"
                                />
                                <Button
                                    asChild
                                    size="sm"
                                    className="bg-[#323d8f] hover:bg-[#323d8f]/90"
                                >
                                    <label htmlFor="bulk-file-upload" className="cursor-pointer">
                                        Select File
                                    </label>
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex h-full flex-col space-y-4 overflow-hidden">
                            {/* Selected File Info */}
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

                            {/* Parsing Loading State */}
                            {isParsing && (
                                <div className="text-muted-foreground flex flex-col items-center justify-center gap-3 py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-[#323d8f]" />
                                    <p className="text-sm">Analyzing file content...</p>
                                </div>
                            )}

                            {/* Parse Results */}
                            {!isParsing && parseResult && (
                                <div className="flex flex-1 flex-col gap-4 overflow-hidden">
                                    {/* Summary Stats */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 p-3 dark:border-emerald-900/30 dark:bg-emerald-950/20">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                                                {parseResult.users.length} Valid Users
                                            </span>
                                        </div>
                                        <div
                                            className={cn(
                                                'flex items-center gap-2 rounded-lg border p-3',
                                                parseResult.errors.length > 0
                                                    ? 'border-amber-100 bg-amber-50 dark:border-amber-900/30 dark:bg-amber-950/20'
                                                    : 'bg-muted border-border',
                                            )}
                                        >
                                            <AlertCircle
                                                className={cn(
                                                    'h-4 w-4',
                                                    parseResult.errors.length > 0
                                                        ? 'text-amber-600'
                                                        : 'text-muted-foreground',
                                                )}
                                            />
                                            <span
                                                className={cn(
                                                    'text-sm font-medium',
                                                    parseResult.errors.length > 0
                                                        ? 'text-amber-700 dark:text-amber-400'
                                                        : 'text-muted-foreground',
                                                )}
                                            >
                                                {parseResult.errors.length} Issues Found
                                            </span>
                                        </div>
                                    </div>

                                    {/* Warnings list if any */}
                                    {parseResult.errors.length > 0 && (
                                        <ScrollArea className="max-h-[100px] rounded-md border bg-amber-50/30 p-2 dark:bg-amber-950/10">
                                            <ul className="space-y-1">
                                                {parseResult.errors.map((error, i) => (
                                                    <li
                                                        key={i}
                                                        className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-500"
                                                    >
                                                        <span className="mt-0.5">•</span>
                                                        {error}
                                                    </li>
                                                ))}
                                            </ul>
                                        </ScrollArea>
                                    )}

                                    {/* Preview Table */}
                                    <div className="flex-1 overflow-hidden rounded-lg border">
                                        <div className="bg-muted border-b px-4 py-2">
                                            <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                                                Preview Data
                                            </p>
                                        </div>
                                        <ScrollArea className="h-full max-h-[300px]">
                                            <table className="w-full text-left text-xs">
                                                <thead className="bg-background sticky top-0 z-10 border-b">
                                                    <tr>
                                                        <th className="bg-muted/50 px-4 py-2 font-medium">
                                                            Name
                                                        </th>
                                                        <th className="bg-muted/50 px-4 py-2 font-medium">
                                                            Student ID
                                                        </th>
                                                        <th className="bg-muted/50 px-4 py-2 font-medium">
                                                            Course
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y">
                                                    {parseResult.users.map((user, i) => (
                                                        <tr
                                                            key={i}
                                                            className="hover:bg-muted/50 transition-colors"
                                                        >
                                                            <td className="px-4 py-2 font-medium">
                                                                {user.firstName} {user.lastName}
                                                            </td>
                                                            <td className="px-4 py-2">
                                                                {user.studentNo || '-'}
                                                            </td>
                                                            <td className="max-w-[150px] truncate px-4 py-2">
                                                                {user.department || '-'}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </ScrollArea>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter className="bg-muted/20 border-t p-6 pt-2">
                    <Button
                        variant="ghost"
                        onClick={() => handleOpenChange(false)}
                        disabled={isImporting}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={importUsers}
                        disabled={!parseResult || parseResult.users.length === 0 || isImporting}
                        className="min-w-[120px] bg-[#323d8f] hover:bg-[#323d8f]/90"
                    >
                        {isImporting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Importing...
                            </>
                        ) : (
                            <>Import {parseResult?.users.length || 0} Users</>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
