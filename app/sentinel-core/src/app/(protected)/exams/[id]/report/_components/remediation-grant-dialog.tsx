'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import type { ExamReportActionItem } from '@sentinel/shared/types';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    Button,
} from '@sentinel/ui';

interface RemediationGrantDialogProps {
    isOpen: boolean;
    onClose: () => void;
    item: ExamReportActionItem | null;
    overrideType: 'MAKEUP' | 'RETAKE' | null;
    onConfirm: (
        item: ExamReportActionItem,
        type: 'MAKEUP' | 'RETAKE',
        availableFrom: string,
        availableUntil: string,
        notes: string | null,
    ) => Promise<void>;
    isLoading: boolean;
}

export function RemediationGrantDialog({
    isOpen,
    onClose,
    item,
    overrideType,
    onConfirm,
    isLoading,
}: RemediationGrantDialogProps) {
    const [availableFrom, setAvailableFrom] = useState('');
    const [availableUntil, setAvailableUntil] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (isOpen && item) {
            const now = new Date();
            const formatDateTimeLocal = (date: Date) => {
                const pad = (num: number) => String(num).padStart(2, '0');
                const yyyy = date.getFullYear();
                const mm = pad(date.getMonth() + 1);
                const dd = pad(date.getDate());
                const hh = pad(date.getHours());
                const min = pad(date.getMinutes());
                return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
            };

            setAvailableFrom(formatDateTimeLocal(now));
            // default to 2 hours (120 minutes) duration
            setAvailableUntil(formatDateTimeLocal(new Date(now.getTime() + 120 * 60_000)));
            setNotes(overrideType === 'MAKEUP' ? 'Approved makeup window.' : 'Approved retake window.');
        }
    }, [isOpen, item, overrideType]);

    if (!item || !overrideType) {
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const fromDate = new Date(availableFrom);
        const untilDate = new Date(availableUntil);

        if (Number.isNaN(fromDate.getTime()) || Number.isNaN(untilDate.getTime())) {
            return;
        }

        await onConfirm(
            item,
            overrideType,
            fromDate.toISOString(),
            untilDate.toISOString(),
            notes.trim() ? notes.trim() : null,
        );
        onClose();
    };

    const label = overrideType === 'MAKEUP' ? 'Makeup' : 'Retake';
    const studentName = `${item.firstName} ${item.lastName}`;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle>Setup Scheduled {label}</DialogTitle>
                        <DialogDescription>
                            Schedule a cloned remediation exam with the same questions for {studentName} ({item.studentNo}).
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 py-2">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-muted-foreground">
                                Start Date & Time
                            </label>
                            <input
                                type="datetime-local"
                                required
                                value={availableFrom}
                                onChange={(e) => setAvailableFrom(e.target.value)}
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-muted-foreground">
                                End Date & Time
                            </label>
                            <input
                                type="datetime-local"
                                required
                                value={availableUntil}
                                onChange={(e) => setAvailableUntil(e.target.value)}
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-muted-foreground">
                                Notes (Optional)
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={2}
                                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="E.g., Approved makeup exam window."
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || !availableFrom || !availableUntil}
                        >
                            {isLoading ? 'Scheduling...' : `Grant ${label}`}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
