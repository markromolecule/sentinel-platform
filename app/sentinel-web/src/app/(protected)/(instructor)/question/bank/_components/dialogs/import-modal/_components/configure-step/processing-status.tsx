'use client';

import { Loader2 } from 'lucide-react';
import { Progress } from '@sentinel/ui';

interface ProcessingStatusProps {
    isProcessing: boolean;
    progress: number;
    currentStep: string;
}

export function ProcessingStatus({ isProcessing, progress, currentStep }: ProcessingStatusProps) {
    if (!isProcessing) return null;

    return (
        <div className="space-y-2 px-1">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-[#323d8f]" />
                    <p className="text-sm font-medium">Generating question preview</p>
                </div>
                <div className="text-[11px] font-medium text-muted-foreground">
                    {Math.round(progress)}%
                </div>
            </div>
            <p className="text-xs text-muted-foreground">{currentStep}</p>
            <Progress value={progress} className="h-1.5" />
        </div>
    );
}
