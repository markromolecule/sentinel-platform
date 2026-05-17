import { Institution } from '@sentinel/shared/types';

export interface UseInstitutionFacetArgs {
    institutions: Institution[];
}

export interface InstitutionFacetOption {
    label: string;
    value: string;
    description?: string;
    isBranch: boolean;
}
