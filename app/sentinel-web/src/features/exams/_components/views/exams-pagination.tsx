'use client';

import { Button } from '@sentinel/ui';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface ExamsPaginationProps {
    page: number;
    pageCount: number;
    pageSize: number;
    totalCount: number;
    onPageChange: (page: number) => void;
}

function getVisiblePages(page: number, pageCount: number): Array<number | 'ellipsis'> {
    if (pageCount <= 7) {
        return Array.from({ length: pageCount }, (_, index) => index + 1);
    }

    if (page <= 4) {
        return [1, 2, 3, 4, 5, 'ellipsis', pageCount];
    }

    if (page >= pageCount - 3) {
        return [1, 'ellipsis', pageCount - 4, pageCount - 3, pageCount - 2, pageCount - 1, pageCount];
    }

    return [1, 'ellipsis', page - 1, page, page + 1, 'ellipsis', pageCount];
}

export function ExamsPagination({
    page,
    pageCount,
    pageSize,
    totalCount,
    onPageChange,
}: ExamsPaginationProps) {
    const startIndex = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
    const endIndex = totalCount === 0 ? 0 : Math.min(page * pageSize, totalCount);
    const pages = getVisiblePages(page, pageCount);

    if (pageCount <= 1) {
        return null;
    }

    return (
        <div className="border-border/60 flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
                Showing <span className="text-foreground font-medium">{startIndex}</span> to{' '}
                <span className="text-foreground font-medium">{endIndex}</span> of{' '}
                <span className="text-foreground font-medium">{totalCount}</span> exams
            </p>

            <div className="flex items-center gap-2 self-start sm:self-auto">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 px-2.5"
                    disabled={page === 1}
                    onClick={() => onPageChange(page - 1)}
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Previous</span>
                </Button>

                <div className="hidden items-center gap-1 sm:flex">
                    {pages.map((item, index) =>
                        item === 'ellipsis' ? (
                            <div
                                key={`ellipsis-${index}`}
                                className="text-muted-foreground flex h-8 w-8 items-center justify-center"
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </div>
                        ) : (
                            <Button
                                key={item}
                                type="button"
                                size="sm"
                                variant={item === page ? 'secondary' : 'ghost'}
                                className="h-8 min-w-8 px-2"
                                onClick={() => onPageChange(item)}
                            >
                                {item}
                            </Button>
                        ),
                    )}
                </div>

                <div className="border-border/60 text-muted-foreground min-w-[88px] rounded-md border px-3 py-1.5 text-center text-sm sm:hidden">
                    {page} / {pageCount}
                </div>

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 px-2.5"
                    disabled={page === pageCount}
                    onClick={() => onPageChange(page + 1)}
                >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
