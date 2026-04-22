'use client';

import type { ReactNode } from 'react';
import { Button } from '@sentinel/ui';
import * as React from 'react';

type ExamMetadataFormLayoutProps = {
    children: ReactNode;
    footerNote: string;
    isSubmitting: boolean;
    onCancel: () => void;
    submitLabel: string;
    submittingLabel: string;
};

export function ExamMetadataFormLayout({
    children,
    footerNote,
    isSubmitting,
    onCancel,
    submitLabel,
    submittingLabel,
}: ExamMetadataFormLayoutProps) {
    const childrenArray = React.Children.toArray(children);

    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4 sm:px-8">
                <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr]">
                    {/* General Info Column */}
                    <div className="space-y-6">{childrenArray[0]}</div>

                    {/* Vertical Divider */}
                    <div className="bg-border/40 hidden w-px lg:block" />

                    {/* Schedule Column */}
                    <div className="space-y-6">{childrenArray[1]}</div>
                </div>
            </div>

            <div className="border-border/50 bg-background border-t px-6 py-3 sm:px-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-muted-foreground/80 max-w-lg text-[11px] leading-relaxed font-medium">
                        {footerNote}
                    </p>
                    <div className="flex items-center justify-end gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onCancel}
                            className="h-9 px-5 text-sm font-semibold transition-colors"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="h-9 bg-[#323d8f] px-6 text-sm font-bold text-white shadow-md transition-all hover:bg-[#323d8f]/90 active:scale-[0.98]"
                        >
                            {isSubmitting ? submittingLabel : submitLabel}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
