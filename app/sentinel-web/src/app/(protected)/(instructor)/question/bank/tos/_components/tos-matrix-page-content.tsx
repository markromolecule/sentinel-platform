'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button, PageHeader, Separator } from '@sentinel/ui';
import { RefreshCw } from 'lucide-react';
import { useTosMatrixQuery } from '@sentinel/hooks';
import type { TosMatrixRow } from '@sentinel/services';
import { TosStatsCards } from './tos-stats-cards';
import { TosMatrixTable } from './tos-matrix-table';
import { TosTopicDetailSheet } from './tos-topic-detail-sheet';
import { QuestionBankPageShell } from '../../../_components/layout';

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
        <QuestionBankPageShell>
            {/* Page header */}
            <PageHeader
                title="Table of Specifications"
                description="Question distribution across topics and Bloom's cognitive levels."
            >
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push('/question/bank/tos/retired')}
                        className="gap-2"
                    >
                        View Retired Questions
                    </Button>
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
                </div>
            </PageHeader>

            <Separator />

            {/* Content area */}
            <div className="flex flex-col gap-6">
                <TosStatsCards data={data} isLoading={isLoading} />
                <TosMatrixTable data={data} isLoading={isLoading} onRowClick={handleRowClick} />
            </div>

            {/* Topic detail side sheet */}
            <TosTopicDetailSheet
                row={selectedRow}
                open={isSheetOpen}
                onOpenChange={setIsSheetOpen}
            />
        </QuestionBankPageShell>
    );
}
