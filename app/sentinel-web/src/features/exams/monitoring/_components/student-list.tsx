'use client';

import { Input } from '@sentinel/ui';
import { Button } from '@sentinel/ui';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@sentinel/ui';
import { StudentListProps } from '@sentinel/shared/types';
import { statusConfig } from '@sentinel/shared/constants';
import { StudentCard } from './student-card';

/**
 * StudentList renders live-monitoring student cards with search, status filtering, and pagination.
 *
 * @param props - StudentListProps containing students, filters, pagination, and selection handlers.
 */
export function StudentList({
    students,
    selectedId,
    onSelect,
    searchQuery,
    onSearchChange,
    filterStatus,
    onFilterChange,
    page,
    pageSize,
    totalCount,
    onPageChange,
    maxReconnectAttempts,
    overridingStudentId,
    onOverrideReconnect,
    activeLifecycleActionId,
    onLifecycleAction,
}: StudentListProps) {
    const canPaginate =
        typeof page === 'number' &&
        typeof pageSize === 'number' &&
        typeof onPageChange === 'function';
    const currentPage = Math.max(page ?? 1, 1);
    const currentPageSize = Math.max(pageSize ?? students.length, 1);
    const totalItems = totalCount ?? students.length;
    const totalPages = canPaginate ? Math.max(1, Math.ceil(totalItems / currentPageSize)) : 1;
    const startIndex = canPaginate ? (currentPage - 1) * currentPageSize : 0;
    const visibleStudents = canPaginate
        ? students.slice(startIndex, startIndex + currentPageSize)
        : students;
    const showingFrom = totalItems === 0 ? 0 : startIndex + 1;
    const showingTo = totalItems === 0 ? 0 : Math.min(startIndex + currentPageSize, totalItems);
    const hasActiveFilters = searchQuery.trim().length > 0 || filterStatus !== 'all';

    return (
        <div className="space-y-6">
            {/* Header with Search and Filter */}
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex w-full flex-1 gap-3">
                    <div className="relative max-w-sm flex-1">
                        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                        <Input
                            placeholder="Search students..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="bg-background/50 pl-9"
                        />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="border-border/50 shrink-0">
                                <Filter className="mr-2 h-4 w-4" />
                                <span className="hidden sm:inline">
                                    {filterStatus === 'all'
                                        ? 'All Status'
                                        : statusConfig[filterStatus]?.label}
                                </span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onFilterChange('all')}>
                                All Status
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onFilterChange('active')}>
                                Active
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onFilterChange('flagged')}>
                                Flagged
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onFilterChange('submitted')}>
                                Submitted
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onFilterChange('disconnected')}>
                                Disconnected
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Students Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {visibleStudents.length === 0 ? (
                    <div className="border-border/60 text-muted-foreground col-span-full rounded-md border border-dashed px-4 py-10 text-center text-sm">
                        {hasActiveFilters
                            ? 'No students match the current search or status filter.'
                            : 'No students are available for monitoring yet.'}
                    </div>
                ) : (
                    visibleStudents.map((student) => (
                        <StudentCard
                            key={student.id}
                            student={student}
                            isSelected={selectedId === student.id}
                            onClick={() => onSelect(student)}
                            maxReconnectAttempts={maxReconnectAttempts}
                            isOverridingReconnect={overridingStudentId === student.id}
                            onOverrideReconnect={onOverrideReconnect}
                            activeLifecycleActionId={activeLifecycleActionId}
                            onLifecycleAction={onLifecycleAction}
                        />
                    ))
                )}
            </div>

            {/* Pagination */}
            {canPaginate && totalPages > 1 && (
                <div className="border-border/40 flex items-center justify-between border-t pt-6">
                    <p className="text-muted-foreground text-sm font-medium">
                        Showing <span className="text-foreground">{showingFrom}</span> to{' '}
                        <span className="text-foreground">{showingTo}</span> of{' '}
                        <span className="text-foreground">{totalItems}</span> students
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="border-border/50 h-9 w-9"
                            onClick={() => onPageChange?.(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="bg-muted/40 border-border/40 flex h-9 min-w-[32px] items-center justify-center rounded-md border px-3 py-1">
                            <span className="text-sm font-bold">{currentPage}</span>
                            <span className="text-muted-foreground mx-1 text-sm">/</span>
                            <span className="text-muted-foreground text-sm">{totalPages}</span>
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            className="border-border/50 h-9 w-9"
                            onClick={() => onPageChange?.(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
