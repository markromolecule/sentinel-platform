import * as React from 'react';
import type { ExamReportActionItem } from '@sentinel/shared/types';
import { Button, Separator } from '@sentinel/ui';
import { ShieldAlert, ClipboardList, RotateCcw } from 'lucide-react';
import { ActionQueuePanel } from './action-queue-panel';

type ActionQueueType = 'review' | 'makeup' | 'retake';

type ActionQueueViewProps = {
    actionQueues: {
        review: ExamReportActionItem[];
        makeup: ExamReportActionItem[];
        retake: ExamReportActionItem[];
    };
    activeQueue: ActionQueueType;
    setActiveQueue: (queue: ActionQueueType) => void;
    actionPages: Record<ActionQueueType, number>;
    setActionPages: React.Dispatch<React.SetStateAction<Record<ActionQueueType, number>>>;
    activeActionId: string | null;
    examId: string;
    sectionOptions: readonly (readonly [string, string])[];
    onGrantOverride: (item: ExamReportActionItem, type: 'MAKEUP' | 'RETAKE') => Promise<void>;
};

/**
 * Renders the Action Queue panel view, featuring:
 * - Queue category headers and inline tab selector buttons (Needs Review, Needs Makeup, Needs Retake)
 * - Individual queue panel sub-tables mapped to state handlers and paging indicators.
 */
export function ActionQueueView({
    actionQueues,
    activeQueue,
    setActiveQueue,
    actionPages,
    setActionPages,
    activeActionId,
    examId,
    sectionOptions,
    onGrantOverride,
}: ActionQueueViewProps) {
    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h2 className="text-xl font-semibold">Action Queue</h2>
                <p className="text-muted-foreground text-sm">
                    Review, makeup, and retake queues stay on one page and paginate cleanly
                    for large classes.
                </p>
            </div>

            <div className="flex flex-wrap gap-2">
                <Button
                    variant={activeQueue === 'review' ? 'default' : 'outline'}
                    onClick={() => setActiveQueue('review')}
                    className="gap-2"
                >
                    <ShieldAlert className="h-4 w-4" />
                    Needs Review ({actionQueues.review.length})
                </Button>
                <Button
                    variant={activeQueue === 'makeup' ? 'default' : 'outline'}
                    onClick={() => setActiveQueue('makeup')}
                    className="gap-2"
                >
                    <ClipboardList className="h-4 w-4" />
                    Needs Makeup ({actionQueues.makeup.length})
                </Button>
                <Button
                    variant={activeQueue === 'retake' ? 'default' : 'outline'}
                    onClick={() => setActiveQueue('retake')}
                    className="gap-2"
                >
                    <RotateCcw className="h-4 w-4" />
                    Needs Retake ({actionQueues.retake.length})
                </Button>
            </div>

            <Separator />

            {activeQueue === 'review' && (
                <ActionQueuePanel
                    title="Needs Review"
                    description="Use this queue for students with unresolved or high-severity incidents."
                    icon={<ShieldAlert className="h-5 w-5 text-red-500" />}
                    items={actionQueues.review}
                    page={actionPages.review}
                    onPageChange={(page) =>
                        setActionPages((current) => ({ ...current, review: page }))
                    }
                    activeActionId={activeActionId}
                    examId={examId}
                    sectionOptions={sectionOptions}
                />
            )}

            {activeQueue === 'makeup' && (
                <ActionQueuePanel
                    title="Needs Makeup"
                    description="Absent students remain here until a makeup window is granted."
                    icon={<ClipboardList className="h-5 w-5 text-amber-500" />}
                    items={actionQueues.makeup}
                    actionLabel="Grant Makeup"
                    onAction={(item) => {
                        void onGrantOverride(item, 'MAKEUP');
                    }}
                    page={actionPages.makeup}
                    onPageChange={(page) =>
                        setActionPages((current) => ({ ...current, makeup: page }))
                    }
                    activeActionId={activeActionId}
                    examId={examId}
                    sectionOptions={sectionOptions}
                />
            )}

            {activeQueue === 'retake' && (
                <ActionQueuePanel
                    title="Needs Retake"
                    description="Students below the passing score stay here until the instructor grants a retake."
                    icon={<RotateCcw className="h-5 w-5 text-blue-500" />}
                    items={actionQueues.retake}
                    actionLabel="Grant Retake"
                    onAction={(item) => {
                        void onGrantOverride(item, 'RETAKE');
                    }}
                    page={actionPages.retake}
                    onPageChange={(page) =>
                        setActionPages((current) => ({ ...current, retake: page }))
                    }
                    activeActionId={activeActionId}
                    examId={examId}
                    sectionOptions={sectionOptions}
                />
            )}
        </div>
    );
}
