"use client";

import { Button } from "@sentinel/ui";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@sentinel/ui";
import { FileSpreadsheet, X } from "lucide-react";
import { useStudentEnrollment } from "@/app/(protected)/(instructor)/students/_hooks/use-student-enrollment";
import { EnrollmentDropzone } from "@/app/(protected)/(instructor)/students/_components/enrollment/enrollment-dropzone";
import { EnrollmentSummary } from "@/app/(protected)/(instructor)/students/_components/enrollment/enrollment-summary";
import { EnrollmentPreview } from "@/app/(protected)/(instructor)/students/_components/enrollment/enrollment-preview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@sentinel/ui";
import { ManualEntryForm } from "@/app/(protected)/(instructor)/students/_components/manual-entry-form";

type StudentEnrollmentDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function StudentEnrollmentDialog({ open, onOpenChange }: StudentEnrollmentDialogProps) {
    const { file, parseResult, isLoading, processFile, resetState } = useStudentEnrollment();

    const handleClose = () => {
        resetState();
        onOpenChange(false);
    };

    const handleImport = () => {
        // In a real implementation, this would send the data to the backend
        console.log("Importing students:", parseResult?.students);
        handleClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-xl duration-0 animate-none data-[state=open]:animate-none data-[state=closed]:animate-none data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-100 data-[state=closed]:zoom-out-100">
                <DialogHeader>
                    <DialogTitle>Add Students</DialogTitle>
                    <DialogDescription>
                        Add students manually or upload a CSV/Excel file.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="manual" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                        <TabsTrigger value="import">Import File</TabsTrigger>
                    </TabsList>

                    <TabsContent value="manual" className="space-y-4 py-4">
                        <ManualEntryForm onSuccess={handleClose} />
                    </TabsContent>

                    <TabsContent value="import" className="space-y-4 py-4">
                        <div className="space-y-4">
                            {!file ? (
                                <EnrollmentDropzone onFileSelect={processFile} />
                            ) : (
                                /* File Preview */
                                <div className="space-y-4">
                                    {/* Selected File */}
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                                        <div className="flex items-center gap-3">
                                            <FileSpreadsheet className="w-5 h-5 text-[#323d8f]" />
                                            <div>
                                                <p className="text-sm font-medium text-foreground">
                                                    {file.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {(file.size / 1024).toFixed(1)} KB
                                                </p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={resetState}>
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    {isLoading ? (
                                        <div className="text-center py-4">
                                            <p className="text-sm text-muted-foreground">Parsing file...</p>
                                        </div>
                                    ) : parseResult ? (
                                        <>
                                            <EnrollmentSummary result={parseResult} />
                                            <EnrollmentPreview students={parseResult.students} />
                                        </>
                                    ) : null}
                                </div>
                            )}
                        </div>

                        {/* Import Actions */}
                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="outline" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleImport}
                                disabled={!parseResult || parseResult.students.length === 0}
                                className="bg-[#323d8f] hover:bg-[#323d8f]/90"
                            >
                                Import {parseResult?.students.length || 0} Students
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
