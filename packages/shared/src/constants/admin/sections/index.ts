import { SectionStoreState } from '../../../types/admin/sections';
import { MOCK_SECTIONS } from '../../../mock-data';

export const SECTION_QUERY_KEYS = {
    all: ['sections'] as const,
    details: (id: string) => ['sections', id] as const,
};

export const MOCK_SECTIONS_LOCAL = MOCK_SECTIONS;

export const DEFAULT_SECTION_STORE_STATE: SectionStoreState = {
    sections: MOCK_SECTIONS_LOCAL,
};
