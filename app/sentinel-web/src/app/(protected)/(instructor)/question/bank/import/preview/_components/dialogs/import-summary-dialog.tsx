'use client';

import { Dialog, DialogContent, DialogTitle, DialogDescription, Button } from '@sentinel/ui';
import {
    CheckCircle2,
    FileText,
    BarChart,
    ListIcon,
    CircleDot,
    CheckSquare,
    CheckCircle,
    Type,
    ListChecks,
    Underline,
    ListOrdered,
    type LucideIcon,
} from 'lucide-react';
import { QUESTION_DIFFICULTIES } from '@sentinel/shared';

const typeIcons: Record<string, LucideIcon> = {
    MULTIPLE_CHOICE: CircleDot,
    MULTIPLE_RESPONSE: CheckSquare,
    TRUE_FALSE: CheckCircle,
    IDENTIFICATION: Type,
    MATCHING: ListChecks,
    ESSAY: FileText,
    FILL_BLANK: Underline,
    ENUMERATION: ListOrdered,
};

interface ImportSummaryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    summary: {
        total: number;
        typeBreakdown: Record<string, number>;
        difficultyBreakdown: Record<string, number>;
    };
    targetName: string;
}

export function ImportSummaryDialog({
    open,
    onOpenChange,
    onConfirm,
    summary,
    targetName,
}: ImportSummaryDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="overflow-hidden bg-white p-0 sm:max-w-[440px] dark:bg-slate-950">
                <div className="space-y-6 p-6">
                    {/* Header Section */}
                    <div className="flex flex-col items-center space-y-2 text-center">
                        <div className="rounded-full bg-emerald-50 p-2 dark:bg-emerald-950/30">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div className="space-y-1">
                            <DialogTitle className="text-lg font-semibold">
                                Import Successful
                            </DialogTitle>
                            <DialogDescription className="text-sm">
                                Successfully added{' '}
                                <span className="text-foreground font-medium">{summary.total}</span>{' '}
                                questions to{' '}
                                <span className="text-foreground font-medium">{targetName}</span>.
                            </DialogDescription>
                        </div>
                    </div>

                    <div className="space-y-5">
                        {/* Question Types Breakdown */}
                        <div className="space-y-3">
                            <div className="text-muted-foreground flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase">
                                <ListIcon className="h-3.5 w-3.5" />
                                Breakdown by Type
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                {Object.entries(summary.typeBreakdown).map(([type, count]) => {
                                    const Icon = typeIcons[type] || FileText;
                                    return (
                                        <div
                                            key={type}
                                            className="bg-secondary/20 border-border/40 flex items-center justify-between rounded-md border px-3 py-1.5"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <Icon className="text-muted-foreground h-3.5 w-3.5" />
                                                <span className="text-sm capitalize">
                                                    {type.toLowerCase().replace(/_/g, ' ')}
                                                </span>
                                            </div>
                                            <span className="text-sm font-semibold text-[#323d8f]">
                                                {count}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Difficulty Breakdown */}
                        <div className="space-y-3">
                            <div className="text-muted-foreground flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase">
                                <BarChart className="h-3.5 w-3.5" />
                                By Difficulty
                            </div>
                            <div className="flex gap-2">
                                {QUESTION_DIFFICULTIES.map((difficulty) => {
                                    const count = summary.difficultyBreakdown[difficulty] || 0;
                                    const colorMap = {
                                        EASY: 'bg-emerald-50/50 text-emerald-700 border-emerald-100/50',
                                        MODERATE:
                                            'bg-amber-50/50 text-amber-700 border-amber-100/50',
                                        HARD: 'bg-rose-50/50 text-rose-700 border-rose-100/50',
                                    };

                                    return (
                                        <div
                                            key={difficulty}
                                            className={`flex flex-1 flex-col items-center rounded-lg border px-1 py-2 ${colorMap[difficulty as keyof typeof colorMap]}`}
                                        >
                                            <span className="text-[10px] font-bold uppercase opacity-60">
                                                {difficulty}
                                            </span>
                                            <span className="text-base font-bold">{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={onConfirm}
                        className="h-10 w-full bg-[#323d8f] text-sm font-medium text-white hover:bg-[#323d8f]/90"
                    >
                        Return to Workspace
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
