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

    const roundedProgress = Math.min(100, Math.max(0, Math.round(progress)));

    return (
        <div className="rounded-lg border border-border/60 bg-muted/30 p-3 space-y-2.5">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-[#323d8f]" />
                    <p className="text-sm font-semibold text-foreground">Generating Question Preview</p>
                </div>
                <span className="font-mono text-xs font-semibold text-[#323d8f]">
                    {roundedProgress}%
                </span>
            </div>

            <p className="text-xs text-muted-foreground transition-all duration-200">
                {currentStep}
            </p>

            <Progress value={roundedProgress} className="h-2 rounded-full overflow-hidden transition-all duration-300" />

            <p className="text-[11px] text-muted-foreground/80 italic">
                Running in the background. You may keep working or close this dialog without interrupting your generation.
            </p>
        </div>
    );
}
