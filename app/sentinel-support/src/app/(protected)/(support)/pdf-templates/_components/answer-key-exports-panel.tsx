'use client';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sentinel/ui';
import { StatusBadge } from '@/components/common/status-badge';
import type { ExamAnswerKeyExportRecord } from '@/data';
import { Download, Loader2, RefreshCw, Trash2 } from 'lucide-react';

type AnswerKeyExportsPanelProps = {
    exports: ExamAnswerKeyExportRecord[];
    onDownload: (exportId: string) => void;
    onRetry: (exportId: string) => void;
    onDelete: (exportId: string) => void;
    activeDownloadId?: string | null;
    activeRetryId?: string | null;
    activeDeleteId?: string | null;
    canExport?: boolean;
    canManage?: boolean;
};

export function AnswerKeyExportsPanel({
    exports,
    onDownload,
    onRetry,
    onDelete,
    activeDownloadId,
    activeRetryId,
    activeDeleteId,
    canExport,
    canManage,
}: AnswerKeyExportsPanelProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Answer key exports</CardTitle>
                <CardDescription>
                    Review queued, ready, and failed answer key exports for the selected institution
                    and exam.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {exports.length === 0 ? (
                    <div className="text-muted-foreground rounded-lg border border-dashed p-6 text-sm">
                        No answer key exports yet for the current filter.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {exports.map((record) => (
                            <div
                                key={record.exportId}
                                className="flex flex-col gap-4 rounded-xl border p-4 lg:flex-row lg:items-center lg:justify-between"
                            >
                                <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-medium">{record.exportId}</span>
                                        <StatusBadge status={record.status} />
                                    </div>
                                    <p className="text-muted-foreground text-sm">
                                        Created {new Date(record.createdAt).toLocaleString()}
                                        {record.completedAt
                                            ? ` • Completed ${new Date(record.completedAt).toLocaleString()}`
                                            : ''}
                                    </p>
                                    {record.failureMessage ? (
                                        <p className="text-sm text-red-600">
                                            {record.failureMessage}
                                        </p>
                                    ) : null}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {record.status === 'READY' ? (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={
                                                !canExport || activeDownloadId === record.exportId
                                            }
                                            onClick={() => onDownload(record.exportId)}
                                        >
                                            {activeDownloadId === record.exportId ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <Download className="mr-2 h-4 w-4" />
                                            )}
                                            Download
                                        </Button>
                                    ) : null}
                                    {record.status === 'FAILED' ? (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={
                                                !canManage || activeRetryId === record.exportId
                                            }
                                            onClick={() => onRetry(record.exportId)}
                                        >
                                            {activeRetryId === record.exportId ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <RefreshCw className="mr-2 h-4 w-4" />
                                            )}
                                            Retry
                                        </Button>
                                    ) : null}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={!canManage || activeDeleteId === record.exportId}
                                        onClick={() => onDelete(record.exportId)}
                                    >
                                        {activeDeleteId === record.exportId ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="mr-2 h-4 w-4" />
                                        )}
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
