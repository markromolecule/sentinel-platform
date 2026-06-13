'use client';

import type { ReactNode } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@sentinel/ui';

type ExamDialogShellProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    eyebrow: string;
    children: ReactNode;
};

export function ExamDialogShell({
    children,
    description,
    eyebrow,
    onOpenChange,
    open,
    title,
}: ExamDialogShellProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="border-border/60 flex max-h-[calc(100vh-4rem)] flex-col gap-0 overflow-hidden p-0 shadow-2xl data-[state=closed]:animate-none data-[state=open]:animate-none sm:max-w-5xl lg:max-w-[1150px]">
                <DialogHeader className="border-border/50 bg-background border-b px-6 py-4 sm:px-8">
                    <div className="flex flex-col gap-0.5">
                        <p className="text-[11px] font-semibold tracking-[0.18em] text-[#323d8f]/70 uppercase">
                            {eyebrow}
                        </p>
                        <DialogTitle className="text-xl font-bold tracking-tight text-[#323d8f] sm:text-2xl">
                            {title}
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground/90 max-w-3xl text-[13px] leading-relaxed">
                            {description}
                        </DialogDescription>
                    </div>
                </DialogHeader>
                {children}
            </DialogContent>
        </Dialog>
    );
}
