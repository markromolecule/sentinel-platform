'use client';

import { useState } from 'react';
import {
    useAuthLogsQuery,
    useActivityLogsQuery,
    useSystemLogsQuery,
} from '@sentinel/hooks';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    Button,
} from '@sentinel/ui';
import { AuditLogTable } from './audit-log-table';
import { ShieldCheck, Terminal, UserCog, ChevronLeft, ChevronRight } from 'lucide-react';

type LogType = 'auth' | 'activity' | 'system';

export function LogsTabsView() {
    const [activeTab, setActiveTab] = useState<LogType>('auth');
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const params = { page, pageSize };

    // React Query hooks - only enable the active tab's query
    const authQuery = useAuthLogsQuery({
        params,
        enabled: activeTab === 'auth',
    });

    const activityQuery = useActivityLogsQuery({
        params,
        enabled: activeTab === 'activity',
    });

    const systemQuery = useSystemLogsQuery({
        params,
        enabled: activeTab === 'system',
    });

    const handleTabChange = (value: string) => {
        setActiveTab(value as LogType);
        setPage(1); // Reset page on tab switch to avoid out of bounds page numbers
    };

    const getActiveQueryData = () => {
        switch (activeTab) {
            case 'auth':
                return {
                    data: authQuery.data,
                    isLoading: authQuery.isLoading || authQuery.isFetching,
                    isError: authQuery.isError,
                    error: authQuery.error,
                };
            case 'activity':
                return {
                    data: activityQuery.data,
                    isLoading: activityQuery.isLoading || activityQuery.isFetching,
                    isError: activityQuery.isError,
                    error: activityQuery.error,
                };
            case 'system':
                return {
                    data: systemQuery.data,
                    isLoading: systemQuery.isLoading || systemQuery.isFetching,
                    isError: systemQuery.isError,
                    error: systemQuery.error,
                };
        }
    };

    const { data, isLoading, isError, error } = getActiveQueryData();
    const items = data?.items ?? [];
    const totalPages = data?.totalPages ?? 1;
    const hasMore = data?.hasMore ?? false;

    return (
        <div className="space-y-4">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-md bg-muted/20 border">
                    <TabsTrigger value="auth" className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                        Auth Logs
                    </TabsTrigger>
                    <TabsTrigger value="activity" className="flex items-center gap-2">
                        <UserCog className="h-4 w-4 text-blue-500" />
                        Activity Logs
                    </TabsTrigger>
                    <TabsTrigger value="system" className="flex items-center gap-2">
                        <Terminal className="h-4 w-4 text-indigo-500" />
                        System Logs
                    </TabsTrigger>
                </TabsList>

                {isError && (
                    <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-xs border border-destructive/20 mt-4">
                        Failed to fetch logs: {error?.message || 'Unknown error occurred.'}
                    </div>
                )}

                <TabsContent value="auth" className="mt-4">
                    <AuditLogTable logs={items} isLoading={isLoading && activeTab === 'auth'} />
                </TabsContent>

                <TabsContent value="activity" className="mt-4">
                    <AuditLogTable logs={items} isLoading={isLoading && activeTab === 'activity'} />
                </TabsContent>

                <TabsContent value="system" className="mt-4">
                    <AuditLogTable logs={items} isLoading={isLoading && activeTab === 'system'} />
                </TabsContent>
            </Tabs>

            {/* Pagination Controls */}
            {data && totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-border pt-4">
                    <div className="text-xs text-muted-foreground">
                        Showing page <span className="font-semibold text-foreground">{page}</span> of{' '}
                        <span className="font-semibold text-foreground">{totalPages}</span> (Total:{' '}
                        <span className="font-semibold text-foreground">{data.total}</span> logs)
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                            disabled={page === 1 || isLoading}
                            className="h-8 px-3 text-xs gap-1 flex items-center"
                        >
                            <ChevronLeft className="h-3.5 w-3.5" />
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={page === totalPages || !hasMore || isLoading}
                            className="h-8 px-3 text-xs gap-1 flex items-center"
                        >
                            Next
                            <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
