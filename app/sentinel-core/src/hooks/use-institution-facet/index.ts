'use client';

import { useStableValue } from '@sentinel/hooks';
import { UseInstitutionFacetArgs } from './_types';

/**
 * Hook to generate institution facet options with branch/template indicators.
 */
export function useInstitutionFacet({ institutions }: UseInstitutionFacetArgs) {
    return useStableValue(
        () =>
            institutions.map((institution) => {
                const isBranch = Boolean(institution.parentInstitutionId);
                return {
                    label: institution.name,
                    value: institution.id,
                    isBranch,
                };
            }),
        [institutions],
    );
}
