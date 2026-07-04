import { type ReactNode } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@sentinel/ui';
import type { ExamReportActionItem } from '@sentinel/shared/types';

interface ActionListCardProps {
    title: string;
    icon: ReactNode;
    items: ExamReportActionItem[];
    emptyMessage: string;
    actionLabel?: string;
    onAction?: (item: ExamReportActionItem) => void;
    activeActionId?: string | null;
}

export function ActionListCard({
    title,
    icon,
    items,
    emptyMessage,
    actionLabel,
    onAction,
    activeActionId,
}: ActionListCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-base">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent className="space-y-3">
                {items.length === 0 ? (
                    <p className="text-muted-foreground text-sm">{emptyMessage}</p>
                ) : (
                    items.slice(0, 5).map((item) => (
                        <div
                            key={`${item.id}-${item.reason}`}
                            className="border-border/70 space-y-3 rounded-lg border p-3"
                        >
                            <div>
                                <div className="font-medium">
                                    {item.lastName}, {item.firstName}
                                </div>
                                <div className="text-muted-foreground text-sm">
                                    {item.studentNo} • {item.reason}
                                </div>
                            </div>
                            {actionLabel && onAction ? (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onAction(item)}
                                    disabled={activeActionId === item.studentId}
                                >
                                    {activeActionId === item.studentId
                                        ? 'Applying...'
                                        : actionLabel}
                                </Button>
                            ) : null}
                        </div>
                    ))
                )}
                {items.length > 5 ? (
                    <p className="text-muted-foreground text-xs">
                        Showing 5 of {items.length} students.
                    </p>
                ) : null}
            </CardContent>
        </Card>
    );
}
