"use client";

import { Input } from "@sentinel/ui";
import { Button } from "@sentinel/ui";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@sentinel/ui";
import { StudentListProps } from '@sentinel/shared/types';
import { statusConfig } from '@sentinel/shared/constants';
import { StudentCard } from "./student-card";
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
}: StudentListProps) {
    const canPaginate =
        typeof page === "number" &&
        typeof pageSize === "number" &&
        typeof onPageChange === "function";
    const currentPage = Math.max(page ?? 1, 1);
    const currentPageSize = Math.max(pageSize ?? students.length, 1);
    const totalItems = totalCount ?? students.length;
    const totalPages = canPaginate ? Math.max(1, Math.ceil(totalItems / currentPageSize)) : 1;
    const startIndex = canPaginate ? (currentPage - 1) * currentPageSize : 0;
    const visibleStudents = canPaginate
        ? students.slice(startIndex, startIndex + currentPageSize)
        : students;
    const showingFrom = totalItems === 0 ? 0 : startIndex + 1;
    const showingTo =
        totalItems === 0 ? 0 : Math.min(startIndex + currentPageSize, totalItems);

    return (
        <div className="space-y-6">
            {/* Header with Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="flex gap-3 flex-1 w-full">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search students..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-9 bg-background/50"
                        />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="shrink-0 border-border/50">
                                <Filter className="w-4 h-4 mr-2" />
                                <span className="hidden sm:inline">
                                    {filterStatus === "all"
                                        ? "All Status"
                                        : statusConfig[filterStatus]?.label}
                                </span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onFilterChange("all")}>
                                All Status
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onFilterChange("active")}>
                                Active
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onFilterChange("flagged")}>
                                Flagged
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onFilterChange("submitted")}>
                                Submitted
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onFilterChange("disconnected")}>
                                Disconnected
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Students Grid */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {visibleStudents.map((student) => (
                    <StudentCard
                        key={student.id}
                        student={student}
                        isSelected={selectedId === student.id}
                        onClick={() => onSelect(student)}
                    />
                ))}
            </div>

            {/* Pagination */}
            {canPaginate && totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-border/40 pt-6">
                    <p className="text-sm text-muted-foreground font-medium">
                        Showing <span className="text-foreground">{showingFrom}</span> to{" "}
                        <span className="text-foreground">{showingTo}</span> of{" "}
                        <span className="text-foreground">{totalItems}</span> students
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 border-border/50"
                            onClick={() => onPageChange?.(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <div className="flex items-center justify-center min-w-[32px] h-9 rounded-md bg-muted/40 border border-border/40 px-3 py-1">
                            <span className="text-sm font-bold">{currentPage}</span>
                            <span className="text-sm text-muted-foreground mx-1">/</span>
                            <span className="text-sm text-muted-foreground">{totalPages}</span>
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 border-border/50"
                            onClick={() => onPageChange?.(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
