'use client';

import * as React from 'react';
import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Input,
    Label,
    PermissionDeniedState,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Skeleton,
} from '@sentinel/ui';
import { FileBarChart } from 'lucide-react';
import { AnalyticsPageShell } from '../_components/layout';
import { useAcademicScope } from '@/hooks/use-academic-scope';
import {
    useActivePermissions,
    useAnalyticsReportDownloadMutation,
    useAnalyticsReportsQuery,
    useGenerateAnalyticsReportMutation,
    useInstitutionsQuery,
    useRetryAnalyticsReportMutation,
    useServerPagination,
} from '@/data';
import { AnalyticsReportsList } from '@/app/(protected)/analytics/_components';
import { toast } from 'sonner';

type ReportPreset = 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'LAST_90_DAYS' | 'CUSTOM';

const DEFAULT_PRESET: ReportPreset = 'LAST_30_DAYS';

function buildDefaultTitle() {
    return `Overall Analytics Report - ${new Date().toLocaleDateString()}`;
}

function countInclusiveDays(startDate?: string, endDate?: string) {
    if (!startDate || !endDate) {
        return 0;
    }

    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);
    const diffMs = end.getTime() - start.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
}

function validateReportRequest(input: {
    institutionId: string;
    title: string;
    preset: ReportPreset;
    startDate: string;
    endDate: string;
}) {
    const errors: string[] = [];

    if (!input.institutionId) {
        errors.push('Choose an institution before queueing a report.');
    }

    if (!input.title.trim()) {
        errors.push('Title is required.');
    }

    if (input.preset === 'CUSTOM') {
        if (!input.startDate || !input.endDate) {
            errors.push('Custom range requires both a start and end date.');
        } else {
            const start = new Date(`${input.startDate}T00:00:00`);
            const end = new Date(`${input.endDate}T00:00:00`);

            if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
                errors.push('Custom range must use valid dates.');
            } else if (end < start) {
                errors.push('End date must be the same as or later than the start date.');
            } else if (countInclusiveDays(input.startDate, input.endDate) > 366) {
                errors.push('Custom range cannot exceed 366 days.');
            }
        }
    }

    return errors;
}

export default function ReportsAnalyticsPage() {
    const { institutionId: scopedInstitutionId, isLoading: isScopeLoading } = useAcademicScope();
    const { hasPermission } = useActivePermissions();
    const canViewReports = hasPermission('reports:view');
    const canGenerateReports = hasPermission('reports:generate');
    const canExportReports = hasPermission('reports:export');

    const { pagination, setPagination } = useServerPagination([scopedInstitutionId]);
    const { data: institutions = [] } = useInstitutionsQuery();

    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [selectedInstitutionId, setSelectedInstitutionId] = React.useState(
        scopedInstitutionId || '',
    );
    const [title, setTitle] = React.useState(buildDefaultTitle);
    const [preset, setPreset] = React.useState<ReportPreset>(DEFAULT_PRESET);
    const [startDate, setStartDate] = React.useState('');
    const [endDate, setEndDate] = React.useState('');
    const [validationErrors, setValidationErrors] = React.useState<string[]>([]);
    const [activeDownloadId, setActiveDownloadId] = React.useState<string | null>(null);
    const [activeRetryId, setActiveRetryId] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (scopedInstitutionId && !selectedInstitutionId) {
            setSelectedInstitutionId(scopedInstitutionId);
        }
    }, [scopedInstitutionId, selectedInstitutionId]);

    const reportsQuery = useAnalyticsReportsQuery({
        payload: {
            institutionId: selectedInstitutionId || undefined,
            page: pagination.pageIndex + 1,
            limit: pagination.pageSize,
        },
        enabled: canViewReports && !isScopeLoading,
    });

    const generateReportMutation = useGenerateAnalyticsReportMutation({
        onSuccess: async () => {
            setIsDialogOpen(false);
            setValidationErrors([]);
            setTitle(buildDefaultTitle());
            setPreset(DEFAULT_PRESET);
            setStartDate('');
            setEndDate('');
        },
    });

    const downloadReportMutation = useAnalyticsReportDownloadMutation();
    const retryReportMutation = useRetryAnalyticsReportMutation();

    const institutionNameById = React.useMemo(
        () =>
            institutions.reduce<Record<string, string>>((acc, institution) => {
                acc[institution.id] = institution.name;
                return acc;
            }, {}),
        [institutions],
    );

    const pageCount = Math.max(
        1,
        Math.ceil((reportsQuery.data?.total_records ?? 0) / pagination.pageSize),
    );

    const handleSubmit = async () => {
        const errors = validateReportRequest({
            institutionId: selectedInstitutionId,
            title,
            preset,
            startDate,
            endDate,
        });

        setValidationErrors(errors);

        if (errors.length > 0) {
            return;
        }

        await generateReportMutation.mutateAsync({
            institutionId: selectedInstitutionId,
            title: title.trim(),
            period: preset,
            startDate: preset === 'CUSTOM' ? startDate : undefined,
            endDate: preset === 'CUSTOM' ? endDate : undefined,
            timezone: 'Asia/Manila',
        });
    };

    const handleDownload = async (reportId: string) => {
        try {
            setActiveDownloadId(reportId);
            const response = await downloadReportMutation.mutateAsync(reportId);
            window.open(response.downloadUrl, '_blank', 'noopener,noreferrer');
        } catch (error: any) {
            toast.error(error?.message || 'Failed to prepare the report download.');
        } finally {
            setActiveDownloadId(null);
        }
    };

    const handleRetry = async (reportId: string) => {
        try {
            setActiveRetryId(reportId);
            await retryReportMutation.mutateAsync({
                reportId,
                institutionId: selectedInstitutionId || null,
                page: pagination.pageIndex + 1,
                limit: pagination.pageSize,
            });
            toast.success('Report retry queued');
        } catch (error: any) {
            toast.error(error?.message || 'Failed to queue the report retry.');
        } finally {
            setActiveRetryId(null);
        }
    };

    if (!canViewReports) {
        return <PermissionDeniedState resourceName="reports" />;
    }

    return (
        <AnalyticsPageShell
            title="Generated Reports"
            description="Queue overall analytics PDFs, follow their lifecycle, and request a fresh signed download only when you need it."
            actions={
                <Button
                    className="bg-[#323d8f] hover:bg-[#323d8f]/90"
                    disabled={!canGenerateReports}
                    onClick={() => setIsDialogOpen(true)}
                >
                    <FileBarChart className="mr-2 h-4 w-4" />
                    Generate Overall Report
                </Button>
            }
        >
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Report Scope</CardTitle>
                        <CardDescription>
                            Reports are institution-scoped and queued as background PDF exports.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
                        <div className="space-y-2">
                            <Label htmlFor="report-institution-filter">Institution</Label>
                            <Select
                                value={selectedInstitutionId}
                                onValueChange={(value) => {
                                    setSelectedInstitutionId(value);
                                    setPagination((current) => ({ ...current, pageIndex: 0 }));
                                }}
                            >
                                <SelectTrigger id="report-institution-filter">
                                    <SelectValue placeholder="Choose an institution" />
                                </SelectTrigger>
                                <SelectContent>
                                    {institutions.map((institution) => (
                                        <SelectItem key={institution.id} value={institution.id}>
                                            {institution.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="rounded-lg border p-4">
                            <p className="text-muted-foreground text-sm">Download policy</p>
                            <p className="mt-2 text-sm font-medium">
                                Signed URLs are requested at click time and expire after five
                                minutes.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {isScopeLoading || reportsQuery.isLoading ? (
                    <Skeleton className="h-[400px] w-full rounded-xl" />
                ) : (
                    <AnalyticsReportsList
                        reports={reportsQuery.data?.records ?? []}
                        pagination={pagination}
                        onPaginationChange={setPagination}
                        pageCount={pageCount}
                        institutionNameById={institutionNameById}
                        activeDownloadId={activeDownloadId}
                        activeRetryId={activeRetryId}
                        canExportReports={canExportReports}
                        canRetryReports={canGenerateReports}
                        onDownload={handleDownload}
                        onRetry={handleRetry}
                    />
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Queue Overall Report</DialogTitle>
                        <DialogDescription>
                            Choose the target institution and period for the PDF export. The report
                            will be generated asynchronously.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-2 md:grid-cols-2">
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="report-title">Title</Label>
                            <Input
                                id="report-title"
                                value={title}
                                onChange={(event) => setTitle(event.target.value)}
                                placeholder="Overall Analytics Report"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dialog-institution">Institution</Label>
                            <Select
                                value={selectedInstitutionId}
                                onValueChange={setSelectedInstitutionId}
                            >
                                <SelectTrigger id="dialog-institution">
                                    <SelectValue placeholder="Choose an institution" />
                                </SelectTrigger>
                                <SelectContent>
                                    {institutions.map((institution) => (
                                        <SelectItem key={institution.id} value={institution.id}>
                                            {institution.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dialog-period-preset">Period</Label>
                            <Select
                                value={preset}
                                onValueChange={(value) => setPreset(value as ReportPreset)}
                            >
                                <SelectTrigger id="dialog-period-preset">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LAST_7_DAYS">Last 7 days</SelectItem>
                                    <SelectItem value="LAST_30_DAYS">Last 30 days</SelectItem>
                                    <SelectItem value="LAST_90_DAYS">Last 90 days</SelectItem>
                                    <SelectItem value="CUSTOM">Custom range</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {preset === 'CUSTOM' ? (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="report-start-date">Start date</Label>
                                    <Input
                                        id="report-start-date"
                                        type="date"
                                        value={startDate}
                                        onChange={(event) => setStartDate(event.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="report-end-date">End date</Label>
                                    <Input
                                        id="report-end-date"
                                        type="date"
                                        value={endDate}
                                        onChange={(event) => setEndDate(event.target.value)}
                                    />
                                </div>
                            </>
                        ) : null}
                    </div>

                    {validationErrors.length > 0 ? (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                            <p className="font-medium">Please fix the following:</p>
                            <ul className="mt-2 list-disc space-y-1 pl-5">
                                {validationErrors.map((error) => (
                                    <li key={error}>{error}</li>
                                ))}
                            </ul>
                        </div>
                    ) : null}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                            disabled={generateReportMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={generateReportMutation.isPending}>
                            {generateReportMutation.isPending ? 'Queueing...' : 'Queue report'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AnalyticsPageShell>
    );
}
