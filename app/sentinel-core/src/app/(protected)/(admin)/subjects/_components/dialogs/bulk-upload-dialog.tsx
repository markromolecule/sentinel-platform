'use client';

import {
    createSubject,
    useApi,
} from '@/data';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Upload } from 'lucide-react';
import { SUBJECT_QUERY_KEYS } from '@sentinel/shared/constants';
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
import { Textarea } from '@sentinel/ui';
import { toast } from 'sonner';

export function BulkUploadDialog() {
    const [open, setOpen] = useState(false);
    const [csvData, setCsvData] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const queryClient = useQueryClient();
    const apiClient = useApi();

    async function handleUpload() {
        const lines = csvData
            .trim()
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean);

        if (lines.length === 0) {
            toast.error('No valid lines found. Please check the format.');
            return;
        }

        setIsSubmitting(true);

        let addedCount = 0;
        let failedCount = 0;

        for (const line of lines) {
            const parts = line.split(',').map((value) => value.trim());
            if (parts.length < 2) {
                failedCount += 1;
                continue;
            }

            const [code, title] = parts;

            try {
                await createSubject(apiClient, {
                    code,
                    title,
                });
                addedCount += 1;
            } catch {
                failedCount += 1;
            }
        }

        await queryClient.invalidateQueries({ queryKey: SUBJECT_QUERY_KEYS.all });
        setIsSubmitting(false);

        if (addedCount > 0) {
            toast.success(`Successfully added ${addedCount} subject(s).`);
            if (failedCount === 0) {
                setOpen(false);
                setCsvData('');
            }
        }

        if (failedCount > 0) {
            toast.error(`${failedCount} line(s) failed to import.`);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Bulk Upload
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>Bulk Upload Subjects</DialogTitle>
                    <DialogDescription>
                        Paste CSV rows using:
                        <code>Code, Title</code>
                        <br />
                        <span className="text-muted-foreground text-xs">
                            This imports catalog subjects only. Term coverage and section rollout
                            should be created through subject offerings.
                        </span>
                        <br />
                        Example:
                        <code>CS101, Intro to CS</code>
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Textarea
                        placeholder="CS101, Introduction to Computing"
                        className="min-h-[200px] font-mono text-sm"
                        value={csvData}
                        onChange={(event) => setCsvData(event.target.value)}
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUpload}
                        disabled={isSubmitting}
                        className="bg-[#323d8f] hover:bg-[#323d8f]/90"
                    >
                        {isSubmitting ? 'Importing...' : 'Import Subjects'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
