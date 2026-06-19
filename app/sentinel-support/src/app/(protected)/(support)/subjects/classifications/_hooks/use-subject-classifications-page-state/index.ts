'use client';

import { useEffect, useMemo, useState } from 'react';
import {
    isPermissionDeniedError,
    useActivePermissions,
    useDebounce,
    useInstitutionsQuery,
    useSubjectClassificationsQuery,
    useDeleteSubjectClassificationMutation,
} from '@sentinel/hooks';
import { SubjectClassification } from '@sentinel/shared/types';
import { useAcademicScope, useInstitutionFacet } from '@/hooks';

/**
 * Custom hook to manage all page-level state, data fetching, filtering,
 * and mutations for the Subject Classifications view.
 */
export function useSubjectClassificationsPageState() {
    const { hasPermission } = useActivePermissions();
    const { institutionId, isLoading: isScopeLoading } = useAcademicScope();
    const [searchTerm, setSearchTerm] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedClassification, setSelectedClassification] =
        useState<SubjectClassification | null>(null);
    const [selectedOfferingClassification, setSelectedOfferingClassification] =
        useState<SubjectClassification | null>(null);
    const debouncedSearch = useDebounce(searchTerm, 400);

    // Facet States
    const [selectedInstitutions, setSelectedInstitutions] = useState<Set<string>>(new Set());
    const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
    const [selectedOrigins, setSelectedOrigins] = useState<Set<string>>(new Set());

    const [hasInitializedScope, setHasInitializedScope] = useState(false);

    useEffect(() => {
        if (!isScopeLoading && !hasInitializedScope) {
            if (institutionId) {
                setSelectedInstitutions(new Set([institutionId]));
            }
            setHasInitializedScope(true);
        }
    }, [institutionId, isScopeLoading, hasInitializedScope]);

    const activeInstitutionId =
        selectedInstitutions.size > 0 ? Array.from(selectedInstitutions)[0] : undefined;

    // Data Fetching
    const { data: institutions = [] } = useInstitutionsQuery();
    const {
        data: classifications = [],
        isLoading: isClassificationsLoading,
        isError,
        error,
    } = useSubjectClassificationsQuery(debouncedSearch || undefined, activeInstitutionId);

    const isLoading = isClassificationsLoading || !hasInitializedScope;

    // Mutations
    const deleteClassification = useDeleteSubjectClassificationMutation();

    // Permissions & Error Handling
    const isViewDenied = isPermissionDeniedError(error, 'subjects:view');
    const canCreate = hasPermission('subjects:create');
    const canOffer = hasPermission('subject_offerings:offer');
    const canUpdate = hasPermission('subjects:update');
    const canDelete = hasPermission('subjects:delete');

    // Mappings & Memoized Computations
    const institutionNameById = useMemo(
        () => new Map(institutions.map((institution) => [institution.id, institution.name])),
        [institutions],
    );

    // Client-side filtering for Type and Origin Status
    const filteredClassifications = useMemo(() => {
        return classifications.filter((classification) => {
            if (selectedTypes.size > 0 && !selectedTypes.has(classification.type)) {
                return false;
            }
            if (
                selectedOrigins.size > 0 &&
                !selectedOrigins.has(classification.inheritanceStatus ?? 'LOCAL')
            ) {
                return false;
            }
            return true;
        });
    }, [classifications, selectedTypes, selectedOrigins]);

    // Facet Options
    const institutionFacetOptions = useInstitutionFacet({ institutions });

    const typeOptions = useMemo(
        () => [
            { label: 'General', value: 'GENERAL' },
            { label: 'Core', value: 'CORE' },
        ],
        [],
    );

    const originOptions = useMemo(
        () => [
            { label: 'Local', value: 'LOCAL' },
            { label: 'Inherited', value: 'INHERITED' },
        ],
        [],
    );

    // Dynamic Counts for Facets
    const typeCounts = useMemo(() => {
        const counts = new Map<string, number>();
        counts.set('GENERAL', classifications.filter((c) => c.type === 'GENERAL').length);
        counts.set('CORE', classifications.filter((c) => c.type === 'CORE').length);
        return counts;
    }, [classifications]);

    const originCounts = useMemo(() => {
        const counts = new Map<string, number>();
        counts.set(
            'LOCAL',
            classifications.filter((c) => (c.inheritanceStatus ?? 'LOCAL') === 'LOCAL').length,
        );
        counts.set(
            'INHERITED',
            classifications.filter((c) => c.inheritanceStatus === 'INHERITED').length,
        );
        return counts;
    }, [classifications]);

    const isFiltered = Boolean(
        searchTerm ||
        selectedInstitutions.size > 0 ||
        selectedTypes.size > 0 ||
        selectedOrigins.size > 0,
    );

    // Action Handlers
    const handleSelectInstitution = (value: string) => {
        const next = new Set<string>();
        if (!selectedInstitutions.has(value)) {
            next.add(value);
        }
        setSelectedInstitutions(next);
    };

    const handleClearInstitutions = () => setSelectedInstitutions(new Set());

    const handleSelectType = (value: string) => {
        const next = new Set(selectedTypes);
        if (next.has(value)) {
            next.delete(value);
        } else {
            next.add(value);
        }
        setSelectedTypes(next);
    };

    const handleClearTypes = () => setSelectedTypes(new Set());

    const handleSelectOrigin = (value: string) => {
        const next = new Set(selectedOrigins);
        if (next.has(value)) {
            next.delete(value);
        } else {
            next.add(value);
        }
        setSelectedOrigins(next);
    };

    const handleClearOrigins = () => setSelectedOrigins(new Set());

    const handleCreate = () => {
        setSelectedClassification(null);
        setDialogOpen(true);
    };

    const handleOffer = (classification: SubjectClassification) => {
        setSelectedOfferingClassification(classification);
    };

    const handleEdit = (classification: SubjectClassification) => {
        setSelectedClassification(classification);
        setDialogOpen(true);
    };

    const handleDelete = (classification: SubjectClassification) => {
        if (window.confirm(`Delete classification "${classification.name}"?`)) {
            deleteClassification.mutate({
                id: classification.id,
                institutionId: classification.institution_id ?? undefined,
            });
        }
    };

    return {
        // States & Setters
        searchTerm,
        setSearchTerm,
        dialogOpen,
        setDialogOpen,
        selectedClassification,
        setSelectedClassification,
        selectedOfferingClassification,
        setSelectedOfferingClassification,
        selectedInstitutions,
        selectedTypes,
        selectedOrigins,

        // Data Query
        institutions,
        classifications,
        filteredClassifications,
        isLoading,
        isError,
        error,
        deleteClassification,

        // Permissions
        isViewDenied,
        canCreate,
        canOffer,
        canUpdate,
        canDelete,

        // Memos/Facets
        institutionNameById,
        institutionFacetOptions,
        typeOptions,
        originOptions,
        typeCounts,
        originCounts,
        isFiltered,

        // Handlers
        handleSelectInstitution,
        handleClearInstitutions,
        handleSelectType,
        handleClearTypes,
        handleSelectOrigin,
        handleClearOrigins,
        handleCreate,
        handleOffer,
        handleEdit,
        handleDelete,
    };
}
