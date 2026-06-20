'use client';

import { useDebounce, useInstitutionsQuery, useSubjectOfferingsQuery } from '@sentinel/hooks';
import { type PaginationState } from '@tanstack/react-table';
import { useEffect, useState } from 'react';

/**
 * Hook for managing state of the Offered Subjects page.
 *
 * This hook handles:
 * - Search term debouncing
 * - Selection of institution
 * - Fetching institutions and subject offerings
 *
 * @returns Page state including search term, selected institution, and data
 */
export function useOfferedPageState() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedInstitutionId, setSelectedInstitutionId] = useState<string | undefined>(
        undefined,
    );
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const debouncedSearch = useDebounce(searchTerm, 500);

    useEffect(() => {
        setPagination((current) =>
            current.pageIndex === 0 ? current : { ...current, pageIndex: 0 },
        );
    }, [debouncedSearch, selectedInstitutionId]);

    const { data: institutions = [] } = useInstitutionsQuery();
    const {
        data: offeringsResponse,
        isLoading,
        isError,
        error,
    } = useSubjectOfferingsQuery({
        search: debouncedSearch || undefined,
        institutionId: selectedInstitutionId || undefined,
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
    });

    const offerings = offeringsResponse?.items ?? [];
    const totalCount = offeringsResponse?.pagination?.total ?? 0;
    const pageCount = offeringsResponse?.pagination
        ? Math.max(1, Math.ceil(totalCount / pagination.pageSize))
        : 1;

    return {
        searchTerm,
        setSearchTerm,
        selectedInstitutionId,
        setSelectedInstitutionId,
        pagination,
        setPagination,
        totalCount,
        pageCount,
        institutions,
        offerings,
        isLoading,
        isError,
        error,
    };
}
