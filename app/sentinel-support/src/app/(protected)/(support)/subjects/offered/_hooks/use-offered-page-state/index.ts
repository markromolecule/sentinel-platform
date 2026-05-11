'use client';

import { useDebounce, useInstitutionsQuery, useSubjectOfferingsQuery } from '@sentinel/hooks';
import { useState } from 'react';

export function useOfferedPageState() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedInstitutionId, setSelectedInstitutionId] = useState('');
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
