'use client';

import { useDebounce, useInstitutionsQuery, useSubjectOfferingsQuery } from '@sentinel/hooks';
import { useState } from 'react';

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
    const debouncedSearch = useDebounce(searchTerm, 500);
    const { data: institutions = [] } = useInstitutionsQuery();
    const {
        data: offerings = [],
        isLoading,
        isError,
        error,
    } = useSubjectOfferingsQuery({
        search: debouncedSearch || undefined,
        institutionId: selectedInstitutionId || undefined,
    });

    return {
        searchTerm,
        setSearchTerm,
        selectedInstitutionId,
        setSelectedInstitutionId,
        institutions,
        offerings,
        isLoading,
        isError,
        error,
    };
}
