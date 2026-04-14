'use client';

import { useState } from 'react';
import { useActivePermissions, useStableValue } from '@sentinel/hooks';
import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@sentinel/ui';
import { FileSpreadsheet, Loader2, PencilLine, Upload } from 'lucide-react';
import {
    parseSubjectManualText,
    useSubjectBulkUpload,
} from '@/app/(protected)/subjects/_hooks/use-subject-bulk-upload';
import { ManualUploadTab } from './bulk-upload/manual-upload-tab';
import { FileUploadTab } from './bulk-upload/file-upload-tab';

type ImportMode = 'manual' | 'file';

export function BulkUploadDialog() {
    const { hasPermission } = useActivePermissions();
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<ImportMode>('manual');
    const [manualInput, setManualInput] = useState('');
    const { parseResult, isParsing, isImporting, parseFile, importRows, resetState, file } =
        useSubjectBulkUpload();

    const manualPreview = useStableValue(() => parseSubjectManualText(manualInput), [manualInput]);
    const activePreview = mode === 'manual' ? manualPreview : parseResult;
    const previewRows = activePreview?.rows ?? [];

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) {
            setManualInput('');
            setMode('manual');
            resetState();
        }

        setOpen(nextOpen);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];

        if (selectedFile) {
            parseFile(selectedFile);
        }
    };

    const handleImport = async () => {
        const result = await importRows(previewRows);

        if (result.successCount > 0 && result.failCount === 0) {
            handleOpenChange(false);
        }
    };

    if (!hasPermission('subjects:create')) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Bulk Upload
                </Button>
            </DialogTrigger>

            <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden p-0 sm:max-w-[760px]">
                <DialogHeader className="border-b px-6 py-5">
                    <DialogTitle className="text-xl">Bulk Upload Subjects</DialogTitle>
                    <DialogDescription className="text-sm leading-5">
                        Add subjects manually or import a CSV/XLSX file. Each row should contain a
                        subject code and title.
                    </DialogDescription>
                </DialogHeader>

                <div className="min-h-0 flex-1 overflow-hidden px-6 py-5">
                    <Tabs
                        value={mode}
                        onValueChange={(value) => setMode(value as ImportMode)}
                        className="flex h-full min-h-0 flex-col gap-4"
                    >
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="manual" className="gap-2">
                                <PencilLine className="h-4 w-4" />
                                Manual Entry
                            </TabsTrigger>
                            <TabsTrigger value="file" className="gap-2">
                                <Upload className="h-4 w-4" />
                                Import File
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="manual" className="mt-0 flex min-h-0 flex-1 flex-col">
                            <ManualUploadTab
                                input={manualInput}
                                onInputChange={setManualInput}
                                isImporting={isImporting}
                                preview={manualPreview}
                            />
                        </TabsContent>

                        <TabsContent value="file" className="mt-0 flex min-h-0 flex-1 flex-col">
                            <FileUploadTab
                                file={file}
                                isParsing={isParsing}
                                isImporting={isImporting}
                                parseResult={parseResult}
                                onFileChange={handleFileChange}
                                onReset={resetState}
                            />
                        </TabsContent>
                    </Tabs>
                </div>

                <DialogFooter className="bg-muted/10 border-t px-6 py-4">
                    <Button
                        variant="outline"
                        onClick={() => handleOpenChange(false)}
                        disabled={isImporting}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleImport}
                        disabled={isImporting || isParsing || previewRows.length === 0}
                        className="bg-[#323d8f] text-white hover:bg-[#323d8f]/90"
                    >
                        {isImporting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Importing...
                            </>
                        ) : (
                            <>
                                Import {previewRows.length} Subject
                                {previewRows.length === 1 ? '' : 's'}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
