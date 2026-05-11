import type { ChangeEvent } from 'react';
import { FileSpreadsheet, Upload } from 'lucide-react';
import { Badge, Button, Textarea } from '@sentinel/ui';
import type { SubjectImportPreview } from '../_types';
import { SUBJECT_BULK_PLACEHOLDER } from '../_constants';

export function SubjectBulkUploadPanel({
    input,
    fileName,
    preview,
    isParsing,
    onInputChange,
    onFileChange,
    onClearFile,
    onApply,
}: {
    input: string;
    fileName: string;
    preview: SubjectImportPreview;
    isParsing: boolean;
    onInputChange: (value: string) => void;
    onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onClearFile: () => void;
    onApply: () => void;
}) {
    return (
        <div className="grid min-w-0 items-stretch gap-4 xl:grid-cols-[minmax(420px,1fr)_minmax(360px,0.75fr)]">
            <div className="flex min-w-0 flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <Button asChild type="button" variant="outline">
                        <label className="cursor-pointer">
                            <Upload className="mr-2 h-4 w-4" />
                            Upload File
                            <input
                                type="file"
                                accept=".csv,.xlsx,.xls"
                                className="hidden"
                                onChange={onFileChange}
                            />
                        </label>
                    </Button>
                    {fileName ? (
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClearFile}
                            className="max-w-full justify-start"
                        >
                            <FileSpreadsheet className="mr-2 h-4 w-4 shrink-0" />
                            <span className="truncate">{fileName}</span>
                        </Button>
                    ) : null}
                    <Button
                        type="button"
                        onClick={onApply}
                        disabled={isParsing || preview.rows.length === 0}
                    >
                        Load {preview.rows.length} Subject{preview.rows.length === 1 ? '' : 's'}
                    </Button>
                </div>
                <Textarea
                    value={input}
                    placeholder={SUBJECT_BULK_PLACEHOLDER}
                    className="h-[300px] min-w-0 resize-none font-mono text-sm xl:h-[360px]"
                    onChange={(event) => onInputChange(event.target.value)}
                />
            </div>
            <div className="border-border flex h-[356px] min-w-0 flex-col rounded-md border bg-white xl:h-[416px]">
                <div className="flex min-w-0 items-center justify-between gap-3 border-b px-4 py-3">
                    <p className="text-sm font-medium">Preview</p>
                    <Badge variant="secondary" className="shrink-0">
                        {isParsing ? 'Parsing' : `${preview.rows.length} ready`}
                    </Badge>
                </div>
                <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
                    {preview.rows.length > 0 ? (
                        <div className="divide-y">
                            {preview.rows.map((row) => (
                                <div
                                    key={`${row.sourceLabel}-${row.code}`}
                                    className="grid min-h-10 min-w-0 items-center gap-1 px-4 py-2 text-sm sm:grid-cols-[minmax(86px,112px)_minmax(0,1fr)] sm:gap-3"
                                >
                                    <span className="min-w-0 truncate font-medium">{row.code}</span>
                                    <span className="text-muted-foreground min-w-0 break-words sm:truncate">
                                        {row.title}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground px-4 py-6 text-sm">
                            Paste or upload subjects to preview rows.
                        </p>
                    )}
                    {preview.errors.length > 0 ? (
                        <div className="border-t px-4 py-3">
                            {preview.errors.slice(0, 4).map((error) => (
                                <p key={error} className="text-destructive text-xs">
                                    {error}
                                </p>
                            ))}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
