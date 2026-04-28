'use client';

import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
    Button,
} from '@sentinel/ui';
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
    type LucideIcon
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
            <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden bg-white dark:bg-slate-950">
                <div className="p-6 space-y-6">
                    {/* Header Section */}
                    <div className="flex flex-col items-center text-center space-y-2">
                        <div className="rounded-full bg-emerald-50 p-2 dark:bg-emerald-950/30">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div className="space-y-1">
                            <DialogTitle className="text-lg font-semibold">Import Successful</DialogTitle>
                            <DialogDescription className="text-sm">
                                Successfully added <span className="font-medium text-foreground">{summary.total}</span> questions to <span className="font-medium text-foreground">{targetName}</span>.
                            </DialogDescription>
                        </div>
                    </div>

                    <div className="space-y-5">
                        {/* Question Types Breakdown */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                                <ListIcon className="h-3.5 w-3.5" />
                                Breakdown by Type
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                {Object.entries(summary.typeBreakdown).map(([type, count]) => {
                                    const Icon = typeIcons[type] || FileText;
                                    return (
                                        <div
                                            key={type}
                                            className="flex items-center justify-between py-1.5 px-3 rounded-md bg-secondary/20 border border-border/40"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
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
                            <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                                <BarChart className="h-3.5 w-3.5" />
                                By Difficulty
                            </div>
                            <div className="flex gap-2">
                                {QUESTION_DIFFICULTIES.map((difficulty) => {
                                    const count = summary.difficultyBreakdown[difficulty] || 0;
                                    const colorMap = {
                                        EASY: 'bg-emerald-50/50 text-emerald-700 border-emerald-100/50',
                                        MODERATE: 'bg-amber-50/50 text-amber-700 border-amber-100/50',
                                        HARD: 'bg-rose-50/50 text-rose-700 border-rose-100/50',
                                    };

                                    return (
                                        <div
                                            key={difficulty}
                                            className={`flex-1 flex flex-col items-center py-2 px-1 rounded-lg border ${colorMap[difficulty as keyof typeof colorMap]}`}
                                        >
                                            <span className="text-[10px] font-bold uppercase opacity-60">
                                                {difficulty}
                                            </span>
                                            <span className="text-base font-bold">
                                                {count}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={onConfirm}
                        className="w-full bg-[#323d8f] hover:bg-[#323d8f]/90 text-white h-10 text-sm font-medium"
                    >
                        Return to Workspace
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

