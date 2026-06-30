'use client';

import { Button, Card, SearchBar } from '@sentinel/ui';
import { type SubjectClassification } from '@sentinel/shared/types';
import { SubjectClassificationCard } from '../cards/subject-classification-card';
import { SubjectClassificationsEmptyState } from './subject-classifications-empty-state';
import { type PaginationState } from '@tanstack/react-table';
import { isParentOwnedRecord } from '@/components/common/inheritance-status-badge';

interface SubjectClassificationsListProps {
    classifications: SubjectClassification[];
    isLoading?: boolean;
    searchTerm?: string;
    onSearchChange?: (value: string) => void;
    onEdit?: (classification: SubjectClassification) => void;
    onOffer?: (classification: SubjectClassification) => void;
    canCreate?: boolean;
    onCreate?: () => void;
    canOffer?: boolean;
    canDelete?: boolean;
    pagination?: PaginationState;
    onPaginationChange?: (pagination: PaginationState) => void;
    pageCount?: number;
    totalCount?: number;
}

export function SubjectClassificationsList({
    classifications,
    isLoading = false,
    searchTerm,
    onSearchChange,
    onEdit,
    onOffer,
    canCreate = false,
    onCreate,
    canOffer = false,
    canDelete = false,
    pagination,
    onPaginationChange,
    pageCount = 1,
    totalCount,
}: SubjectClassificationsListProps) {
    const canGoPrevious = Boolean(pagination && onPaginationChange && pagination.pageIndex > 0);
    const canGoNext = Boolean(
        pagination && onPaginationChange && pagination.pageIndex < pageCount - 1,
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div className="w-full max-w-sm">
                    <SearchBar
                        value={searchTerm}
                        onChange={(event) => onSearchChange?.(event.target.value)}
                        placeholder="Search groups..."
                    />
                </div>
                {!isLoading && classifications.length > 0 && (
                    <div className="text-muted-foreground hidden text-sm font-medium md:block">
                        Total: {totalCount ?? classifications.length} Groups
                    </div>
                )}
            </div>

            {isLoading ? (
                <div className="grid auto-rows-fr gap-3 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <Card key={index} className="bg-muted/20 min-h-[118px] animate-pulse" />
                    ))}
                </div>
            ) : classifications.length > 0 ? (
                <div className="grid auto-rows-fr gap-3 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                    {classifications.map((classification) => (
                        <SubjectClassificationCard
                            key={classification.id}
                            classification={classification}
                            onEdit={
                                onEdit && !isParentOwnedRecord(classification) ? onEdit : undefined
                            }
                            onOffer={onOffer}
                            canOffer={canOffer}
                            canDelete={canDelete && !isParentOwnedRecord(classification)}
                        />
                    ))}
                </div>
            ) : (
                <SubjectClassificationsEmptyState
                    searchTerm={searchTerm}
                    canCreate={canCreate}
                    onCreate={onCreate}
                />
            )}

            {pagination && onPaginationChange && pageCount > 1 ? (
                <div className="flex items-center justify-between gap-3 border-t pt-4">
                    <div className="text-muted-foreground text-sm">
                        Page {pagination.pageIndex + 1} of {pageCount}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                onPaginationChange({
                                    ...pagination,
                                    pageIndex: Math.max(0, pagination.pageIndex - 1),
                                })
                            }
                            disabled={!canGoPrevious}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                onPaginationChange({
                                    ...pagination,
                                    pageIndex: Math.min(pageCount - 1, pagination.pageIndex + 1),
                                })
                            }
                            disabled={!canGoNext}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
