'use client';
import {
    Badge,
    Button,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@sentinel/ui';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

type ExamAttemptRuntimeHeaderProps = {
    answeredCount: number;
    totalQuestions: number;
    flaggedCount: number;
    showPassagePanel: boolean;
    onTogglePassagePanel: () => void;
    onSubmit: () => void;
    isSubmitting?: boolean;
};

export function ExamAttemptRuntimeHeader({
    answeredCount,
    totalQuestions,
    flaggedCount,
    showPassagePanel,
    onTogglePassagePanel,
    onSubmit,
    isSubmitting,
}: ExamAttemptRuntimeHeaderProps) {
    return (
        <div className="flex flex-wrap items-center gap-2 lg:flex-nowrap lg:justify-end">
            <Badge
                variant="secondary"
                className="rounded-md px-2.5 py-1 text-[11px] sm:px-3 sm:text-xs"
            >
                {answeredCount}/{totalQuestions} answered
            </Badge>
            <Badge
                variant="secondary"
                className="rounded-md px-2.5 py-1 text-[11px] sm:px-3 sm:text-xs"
            >
                {flaggedCount} flagged
            </Badge>

            <TooltipProvider delayDuration={150}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            type="button"
                            variant="outline"
                            className="h-10 gap-2 rounded-md px-3"
                            onClick={onTogglePassagePanel}
                        >
                            {showPassagePanel ? (
                                <PanelLeftClose className="h-4 w-4" />
                            ) : (
                                <PanelLeftOpen className="h-4 w-4" />
                            )}
                            <span className="hidden sm:inline">
                                {showPassagePanel ? 'Hide passage' : 'Show passage'}
                            </span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        {showPassagePanel ? 'Hide passage panel' : 'Show passage panel'}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <Button
                type="button"
                onClick={onSubmit}
                disabled={isSubmitting}
                className="rounded-md px-4"
            >
                {isSubmitting ? 'Preparing...' : 'Turn In'}
            </Button>
        </div>
    );
}
