'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';

import { createSubject, useApi } from '@/data';
import { SUBJECT_QUERY_KEYS } from '@sentinel/shared/constants';
import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    Textarea,
} from '@sentinel/ui';

const BULK_UPLOAD_PLACEHOLDER = 'CS101, Introduction to Computing\nENG202, World Literature';

const BULK_UPLOAD_EXAMPLE = 'Code, Title';

function getNormalizedRows(csvData: string) {
    return csvData
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
}

function useBulkUpload(onSuccess: () => void) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const queryClient = useQueryClient();
    const apiClient = useApi();

    async function processUpload(csvData: string) {
        const rows = getNormalizedRows(csvData);

        if (!rows.length) {
            toast.error('Add at least one subject row to continue.');
            return;
        }

        setIsSubmitting(true);

        try {
            const results = await Promise.allSettled(
                rows.map(async (row) => {
                    const [code, ...titleParts] = row.split(',');
                    const title = titleParts.join(',').trim();

                    if (!code?.trim() || !title) {
                        throw new Error('Invalid format');
                    }

                    return createSubject(apiClient, {
                        code: code.trim(),
                        title,
                    });
                }),
            );

            let addedCount = 0;
            let failedCount = 0;

            results.forEach((result) => {
                if (result.status === 'fulfilled') {
                    addedCount += 1;
                    return;
                }

                failedCount += 1;
            });

            await queryClient.invalidateQueries({ queryKey: SUBJECT_QUERY_KEYS.all });

            if (addedCount > 0) {
                toast.success(`Imported ${addedCount} subject(s).`);
            }

            if (failedCount > 0) {
                toast.error(`Skipped ${failedCount} row(s). Check the format.`);
            }

            if (addedCount > 0 && failedCount === 0) {
                onSuccess();
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return { isSubmitting, processUpload };
}

function BulkUploadTrigger() {
    return (
        <DialogTrigger asChild>
            <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Bulk Upload
            </Button>
        </DialogTrigger>
    );
}

function BulkUploadHeader() {
    return (
        <DialogHeader className="border-border/70 bg-background/95 border-b px-5 py-5">
            <DialogTitle className="text-xl">Bulk Upload Subjects</DialogTitle>
            <DialogDescription className="text-sm leading-5">
                Paste one subject per line using{' '}
                <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono">
                    {BULK_UPLOAD_EXAMPLE}
                </code>
                .
            </DialogDescription>
        </DialogHeader>
    );
}

function BulkUploadTextarea({
    value,
    onChange,
    disabled,
}: {
    value: string;
    onChange: (value: string) => void;
    disabled: boolean;
}) {
    const rowCount = getNormalizedRows(value).length;

    return (
        <div className="space-y-3">
            <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">Subject List</p>
                    <p className="text-muted-foreground text-xs">
                        {rowCount} {rowCount === 1 ? 'row' : 'rows'}
                    </p>
                </div>
                <Textarea
                    placeholder={BULK_UPLOAD_PLACEHOLDER}
                    className="min-h-[220px] resize-y font-mono text-sm"
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    disabled={disabled}
                />
            </div>
        </div>
    );
}

function BulkUploadActions({
    isSubmitting,
    isDisabled,
    onCancel,
    onSubmit,
}: {
    isSubmitting: boolean;
    isDisabled: boolean;
    onCancel: () => void;
    onSubmit: () => void;
}) {
    return (
        <DialogFooter className="border-border/70 bg-muted/10 border-t px-5 py-3">
            <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row sm:items-center">
                <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
                    Cancel
                </Button>
                <Button
                    onClick={onSubmit}
                    disabled={isDisabled}
                    className="bg-[#323d8f] text-white hover:bg-[#323d8f]/90"
                >
                    {isSubmitting ? 'Importing...' : 'Import Subjects'}
                </Button>
            </div>
        </DialogFooter>
    );
}

export function BulkUploadDialog() {
    const [open, setOpen] = useState(false);
    const [csvData, setCsvData] = useState('');

    function handleClose() {
        setOpen(false);
        setCsvData('');
    }

    const { processUpload, isSubmitting } = useBulkUpload(handleClose);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <BulkUploadTrigger />

            <DialogContent
                className="border-border/70 max-w-[calc(100vw-2rem)] overflow-hidden p-0 data-[state=closed]:animate-none data-[state=open]:animate-none sm:max-w-[680px]"
                overlayClassName="data-[state=open]:animate-none data-[state=closed]:animate-none"
            >
                <BulkUploadHeader />

                <div className="px-5 py-4">
                    <BulkUploadTextarea
                        value={csvData}
                        onChange={setCsvData}
                        disabled={isSubmitting}
                    />
                </div>

                <BulkUploadActions
                    isSubmitting={isSubmitting}
                    isDisabled={isSubmitting || !csvData.trim()}
                    onCancel={handleClose}
                    onSubmit={() => processUpload(csvData)}
                />
            </DialogContent>
        </Dialog>
    );
}
