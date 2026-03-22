"use client";

import { useState } from "react";
import { Button } from "@sentinel/ui";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@sentinel/ui";
import { 
    Upload, 
    FileSpreadsheet, 
    X, 
    CheckCircle2, 
    AlertCircle,
    Loader2
} from "lucide-react";
import { cn } from "@sentinel/ui";
import { useBulkUpload } from "../_hooks/use-bulk-upload";
import { ScrollArea } from "@sentinel/ui";

export function BulkUploadDialog() {
    const [open, setOpen] = useState(false);
    const { 
        file, 
        parseResult, 
        isParsing, 
        isImporting, 
        parseFile, 
        importUsers, 
        resetState 
    } = useBulkUpload();

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
                <Button variant="outline" className="border-[#323d8f] text-[#323d8f] hover:bg-[#323d8f]/5">
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Bulk Upload
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle>Bulk Upload Users</DialogTitle>
                    <DialogDescription>
                        Upload a CSV or Excel file containing user information.
                        Required fields: First Name, Last Name, StudentID, Course.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden px-6 pb-6 pt-2">
                    {!file ? (
                        <div className="border-2 border-dashed rounded-xl p-12 text-center transition-colors border-border hover:border-[#323d8f]/50 bg-muted/30">
                            <div className="flex flex-col items-center gap-4">
                                <div className="p-4 rounded-full bg-background border border-border shadow-sm">
                                    <Upload className="w-8 h-8 text-[#323d8f]" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground">
                                        Click to browse or drag and drop
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
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
                                <Button asChild size="sm" className="bg-[#323d8f] hover:bg-[#323d8f]/90">
                                    <label htmlFor="bulk-file-upload" className="cursor-pointer">
                                        Select File
                                    </label>
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 h-full flex flex-col overflow-hidden">
                            {/* Selected File Info */}
                            <div className="flex items-center justify-between p-3 rounded-lg bg-[#323d8f]/5 border border-[#323d8f]/20">
                                <div className="flex items-center gap-3">
                                    <FileSpreadsheet className="w-5 h-5 text-[#323d8f]" />
                                    <div>
                                        <p className="text-sm font-medium text-foreground truncate max-w-[300px]">
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
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
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>

                            {/* Parsing Loading State */}
                            {isParsing && (
                                <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
                                    <Loader2 className="h-8 w-8 animate-spin text-[#323d8f]" />
                                    <p className="text-sm">Analyzing file content...</p>
                                </div>
                            )}

                            {/* Parse Results */}
                            {!isParsing && parseResult && (
                                <div className="flex-1 overflow-hidden flex flex-col gap-4">
                                    {/* Summary Stats */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/30">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                                                {parseResult.users.length} Valid Users
                                            </span>
                                        </div>
                                        <div className={cn(
                                            "flex items-center gap-2 p-3 rounded-lg border",
                                            parseResult.errors.length > 0 
                                                ? "bg-amber-50 border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/30" 
                                                : "bg-muted border-border"
                                        )}>
                                            <AlertCircle className={cn(
                                                "w-4 h-4",
                                                parseResult.errors.length > 0 ? "text-amber-600" : "text-muted-foreground"
                                            )} />
                                            <span className={cn(
                                                "text-sm font-medium",
                                                parseResult.errors.length > 0 ? "text-amber-700 dark:text-amber-400" : "text-muted-foreground"
                                            )}>
                                                {parseResult.errors.length} Issues Found
                                            </span>
                                        </div>
                                    </div>

                                    {/* Warnings list if any */}
                                    {parseResult.errors.length > 0 && (
                                        <ScrollArea className="max-h-[100px] p-2 border rounded-md bg-amber-50/30 dark:bg-amber-950/10">
                                            <ul className="space-y-1">
                                                {parseResult.errors.map((error, i) => (
                                                    <li key={i} className="text-xs text-amber-600 dark:text-amber-500 flex items-start gap-2">
                                                        <span className="mt-0.5">•</span>
                                                        {error}
                                                    </li>
                                                ))}
                                            </ul>
                                        </ScrollArea>
                                    )}

                                    {/* Preview Table */}
                                    <div className="border rounded-lg overflow-hidden flex-1">
                                        <div className="bg-muted px-4 py-2 border-b">
                                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                Preview Data
                                            </p>
                                        </div>
                                        <ScrollArea className="h-full max-h-[300px]">
                                            <table className="w-full text-xs text-left">
                                                <thead className="sticky top-0 bg-background border-b z-10">
                                                    <tr>
                                                        <th className="px-4 py-2 font-medium bg-muted/50">Name</th>
                                                        <th className="px-4 py-2 font-medium bg-muted/50">Student ID</th>
                                                        <th className="px-4 py-2 font-medium bg-muted/50">Course</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y">
                                                    {parseResult.users.map((user, i) => (
                                                        <tr key={i} className="hover:bg-muted/50 transition-colors">
                                                            <td className="px-4 py-2 font-medium">
                                                                {user.firstName} {user.lastName}
                                                            </td>
                                                            <td className="px-4 py-2">{user.studentNo || "-"}</td>
                                                            <td className="px-4 py-2 truncate max-w-[150px]">
                                                                {user.department || "-"}
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

                <DialogFooter className="p-6 pt-2 border-t bg-muted/20">
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
                        className="bg-[#323d8f] hover:bg-[#323d8f]/90 min-w-[120px]"
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
