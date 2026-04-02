'use client';

import { useMemo, useState } from 'react';
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
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    Textarea,
} from '@sentinel/ui';
import { cn } from '@sentinel/ui';
import {
    AlertCircle,
    CheckCircle2,
    FileSpreadsheet,
    Loader2,
    PencilLine,
    Upload,
    X,
} from 'lucide-react';
import {
    parseSubjectManualText,
    useSubjectBulkUpload,
} from '@/app/(protected)/(admin)/subjects/_hooks/use-subject-bulk-upload';

const BULK_UPLOAD_PLACEHOLDER = `Code, Title
GEACM01X, Advanced Communication
CC103, Data Structures and Algorithms`;

type ImportMode = 'manual' | 'file';

function BulkUploadPreview({
    rows,
    errors,
    emptyMessage,
}: {
    rows: Array<{ code: string; title: string; sourceLabel: string }>;
    errors: string[];
    emptyMessage: string;
}) {
    return (
        <div className="flex min-h-0 flex-1 flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 p-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-700">
                        {rows.length} Valid Row{rows.length === 1 ? '' : 's'}
                    </span>
                </div>
                <div
                    className={cn(
                        'flex items-center gap-2 rounded-lg border p-3',
                        errors.length > 0
                            ? 'border-amber-100 bg-amber-50'
                            : 'border-border bg-muted',
                    )}
                >
                    <AlertCircle
                        className={cn(
                            'h-4 w-4',
                            errors.length > 0 ? 'text-amber-600' : 'text-muted-foreground',
                        )}
                    />
                    <span
                        className={cn(
                            'text-sm font-medium',
                            errors.length > 0 ? 'text-amber-700' : 'text-muted-foreground',
                        )}
                    >
                        {errors.length} Issue{errors.length === 1 ? '' : 's'}
                    </span>
                </div>
            </div>

            {errors.length > 0 && (
                <ScrollArea className="max-h-[120px] rounded-md border border-amber-100 bg-amber-50/40 p-3">
                    <ul className="space-y-1">
                        {errors.map((error, index) => (
                            <li
                                key={`${error}-${index}`}
                                className="flex items-start gap-2 text-xs text-amber-700"
                            >
                                <span className="mt-0.5">•</span>
                                <span>{error}</span>
                            </li>
                        ))}
                    </ul>
                </ScrollArea>
            )}

            <div className="min-h-0 flex-1 overflow-hidden rounded-lg border">
                <div className="border-b bg-muted px-4 py-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Preview
                    </p>
                </div>

                {rows.length === 0 ? (
                    <div className="flex h-full min-h-[180px] items-center justify-center px-6 text-center text-sm text-muted-foreground">
                        {emptyMessage}
                    </div>
                ) : (
                    <ScrollArea className="h-[260px]">
                        <table className="w-full text-left text-xs">
                            <thead className="sticky top-0 z-10 border-b bg-background">
                                <tr>
                                    <th className="bg-muted/50 px-4 py-2 font-medium">Code</th>
                                    <th className="bg-muted/50 px-4 py-2 font-medium">Title</th>
                                    <th className="bg-muted/50 px-4 py-2 font-medium">Source</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {rows.map((row) => (
                                    <tr key={`${row.sourceLabel}-${row.code}`} className="hover:bg-muted/50">
                                        <td className="px-4 py-2 font-mono font-medium">{row.code}</td>
                                        <td className="px-4 py-2">{row.title}</td>
                                        <td className="px-4 py-2 text-muted-foreground">
                                            {row.sourceLabel}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </ScrollArea>
                )}
            </div>
        </div>
    );
}

export function BulkUploadDialog() {
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<ImportMode>('manual');
    const [manualInput, setManualInput] = useState('');
    const { file, parseResult, isParsing, isImporting, parseFile, importRows, resetState } =
        useSubjectBulkUpload();

    const manualPreview = useMemo(() => parseSubjectManualText(manualInput), [manualInput]);
    const activePreview = mode === 'manual' ? manualPreview : parseResult;
    const previewRows = activePreview?.rows ?? [];
    const previewErrors = activePreview?.errors ?? [];

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
                            <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[1.05fr,0.95fr]">
                                <div className="flex min-h-0 flex-col gap-3">
                                    <div className="rounded-lg border bg-muted/20 p-4">
                                        <p className="text-sm font-medium">Accepted format</p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            One subject per line using <code>Code, Title</code>.
                                            Header rows are optional.
                                        </p>
                                    </div>

                                    <Textarea
                                        placeholder={BULK_UPLOAD_PLACEHOLDER}
                                        className="min-h-[260px] flex-1 resize-none font-mono text-sm"
                                        value={manualInput}
                                        onChange={(event) => setManualInput(event.target.value)}
                                        disabled={isImporting}
                                    />
                                </div>

                                <BulkUploadPreview
                                    rows={manualPreview.rows}
                                    errors={manualPreview.errors}
                                    emptyMessage="Paste subject rows here to see a live preview before importing."
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="file" className="mt-0 flex min-h-0 flex-1 flex-col">
                            {!file ? (
                                <div className="border-border bg-muted/30 flex min-h-[360px] flex-1 items-center justify-center rounded-xl border-2 border-dashed p-12 text-center transition-colors hover:border-[#323d8f]/50">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="bg-background border-border rounded-full border p-4 shadow-sm">
                                            <Upload className="h-8 w-8 text-[#323d8f]" />
                                        </div>
                                        <div>
                                            <p className="text-foreground text-sm font-medium">
                                                Click to browse a spreadsheet
                                            </p>
                                            <p className="text-muted-foreground mt-1 text-xs">
                                                CSV, XLSX, or XLS files are supported
                                            </p>
                                        </div>
                                        <input
                                            type="file"
                                            accept=".csv,.xlsx,.xls"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="subject-bulk-upload"
                                            disabled={isImporting}
                                        />
                                        <Button
                                            asChild
                                            size="sm"
                                            className="bg-[#323d8f] hover:bg-[#323d8f]/90"
                                            disabled={isImporting}
                                        >
                                            <label htmlFor="subject-bulk-upload" className="cursor-pointer">
                                                Select File
                                            </label>
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex min-h-0 flex-1 flex-col gap-4">
                                    <div className="flex items-center justify-between rounded-lg border border-[#323d8f]/20 bg-[#323d8f]/5 p-3">
                                        <div className="flex items-center gap-3">
                                            <FileSpreadsheet className="h-5 w-5 text-[#323d8f]" />
                                            <div>
                                                <p className="text-foreground max-w-[320px] truncate text-sm font-medium">
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

                                    {isParsing ? (
                                        <div className="text-muted-foreground flex flex-1 flex-col items-center justify-center gap-3">
                                            <Loader2 className="h-8 w-8 animate-spin text-[#323d8f]" />
                                            <p className="text-sm">Analyzing file content...</p>
                                        </div>
                                    ) : (
                                        <BulkUploadPreview
                                            rows={parseResult?.rows ?? []}
                                            errors={parseResult?.errors ?? []}
                                            emptyMessage="Upload a CSV or Excel file to preview subject rows here."
                                        />
                                    )}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>

                <DialogFooter className="border-t bg-muted/10 px-6 py-4">
                    <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isImporting}>
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
                            <>Import {previewRows.length} Subject{previewRows.length === 1 ? '' : 's'}</>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
