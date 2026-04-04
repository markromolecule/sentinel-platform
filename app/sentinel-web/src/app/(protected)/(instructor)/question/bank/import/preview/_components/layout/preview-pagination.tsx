'use client';

import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@sentinel/ui";
import { QUESTIONS_PER_PAGE } from "../../_constants";

interface PreviewPaginationProps {
    currentPage: number;
    totalPages: number;
    totalQuestions: number;
    onPageChange: (page: number) => void;
}

export function PreviewPagination({ 
    currentPage, 
    totalPages, 
    totalQuestions, 
    onPageChange 
}: PreviewPaginationProps) {
    if (totalPages <= 1) return null;

    const pageStartIndex = (currentPage - 1) * QUESTIONS_PER_PAGE;
    const pageEndIndex = Math.min(pageStartIndex + QUESTIONS_PER_PAGE, totalQuestions);

    return (
        <Pagination className="justify-between">
            <div className="text-sm text-muted-foreground">
                Showing {pageStartIndex + 1}-{pageEndIndex} of {totalQuestions} questions
            </div>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        href="#"
                        onClick={(event) => {
                            event.preventDefault();
                            if (currentPage > 1) onPageChange(currentPage - 1);
                        }}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                    <PaginationItem key={page}>
                        <PaginationLink
                            href="#"
                            isActive={page === currentPage}
                            onClick={(event) => {
                                event.preventDefault();
                                onPageChange(page);
                            }}
                        >
                            {page}
                        </PaginationLink>
                    </PaginationItem>
                ))}

                <PaginationItem>
                    <PaginationNext
                        href="#"
                        onClick={(event) => {
                            event.preventDefault();
                            if (currentPage < totalPages) onPageChange(currentPage + 1);
                        }}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}
