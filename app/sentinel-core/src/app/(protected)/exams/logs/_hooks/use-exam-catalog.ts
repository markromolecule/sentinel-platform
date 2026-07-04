import { useState } from 'react';
import { useExamReportsListQuery, useDebounce } from '@sentinel/hooks';

/**
 * Hook to manage reportable exams list, pagination, and catalog search.
 */
export function useExamCatalog(pageSize: number = 6) {
    const [catalogSearch, setCatalogSearch] = useState('');
    const [catalogPage, setCatalogPage] = useState(1);
    const debouncedCatalogSearch = useDebounce(catalogSearch, 300);

    const { data: catalogData, isLoading: isCatalogLoading } = useExamReportsListQuery({
        page: catalogPage,
        limit: pageSize,
        search: debouncedCatalogSearch.trim() || undefined,
    });

    const reportableExams = catalogData?.data ?? [];
    const catalogTotalCount = catalogData?.meta?.total ?? 0;
    const catalogPageCount = catalogData?.meta?.totalPages ?? 1;

    const handleCatalogSearchChange = (value: string) => {
        setCatalogSearch(value);
        setCatalogPage(1);
    };

    return {
        catalogSearch,
        setCatalogSearch: handleCatalogSearchChange,
        catalogPage,
        setCatalogPage,
        catalogTotalCount,
        catalogPageCount,
        reportableExams,
        isCatalogLoading,
    };
}
