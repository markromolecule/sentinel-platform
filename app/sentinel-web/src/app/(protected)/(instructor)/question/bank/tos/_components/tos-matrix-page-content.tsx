'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button, PageHeader, Separator } from '@sentinel/ui';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useTosMatrixQuery } from '@sentinel/hooks';
import type { TosMatrixRow } from '@sentinel/services';
import { TosStatsCards } from './tos-stats-cards';
import { TosMatrixTable } from './tos-matrix-table';
import { TosTopicDetailSheet } from './tos-topic-detail-sheet';
import { TosLevelDistribution } from './tos-level-distribution';

export function TosMatrixPageContent() {
    const router = useRouter();
    const { data, isLoading, refetch, isFetching } = useTosMatrixQuery();
    const [selectedRow, setSelectedRow] = React.useState<TosMatrixRow | null>(null);
    const [isSheetOpen, setIsSheetOpen] = React.useState(false);

    const handleRowClick = (row: TosMatrixRow) => {
        setSelectedRow(row);
        setIsSheetOpen(true);
    };

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            {/* Back navigation */}
            <div className="flex items-center">
                <Button
                    variant="ghost"
                    onClick={() => router.push('/question/bank')}
                    className="gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Question Bank
                </Button>
            </div>

            {/* Page header */}
            <PageHeader
                title="TOS Matrix"
                description="Table of Specifications — question distribution across topics and Bloom's cognitive levels."
            >
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void refetch()}
                    disabled={isFetching}
                    className="gap-2"
                >
                    <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </PageHeader>

            <Separator />

            {/* Content grid */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
                {/* Left column: Main Table */}
                <div className="lg:col-span-3">
                    <TosMatrixTable data={data} isLoading={isLoading} onRowClick={handleRowClick} />
                </div>

                {/* Right column: Stats and Distribution */}
                <div className="flex flex-col gap-6">
                    <TosStatsCards data={data} isLoading={isLoading} />
                    <TosLevelDistribution data={data} isLoading={isLoading} />
                </div>
            </div>

            {/* Topic detail side sheet */}
            <TosTopicDetailSheet
                row={selectedRow}
                open={isSheetOpen}
                onOpenChange={setIsSheetOpen}
            />
        </div>
    );
}
