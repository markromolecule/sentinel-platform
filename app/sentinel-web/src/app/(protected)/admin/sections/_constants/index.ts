import { SectionStoreState } from "../_types";
import { MOCK_SECTIONS } from "@sentinel/shared/src/mock-data";

// We need to match the type expected by SectionStoreState which might expect full Section objects
// But MOCK_SECTIONS in shared might be Omit<Section, "status"> or full Section.
// In mock-data/index.ts I exported MOCK_SECTIONS as Omit<Section, "status">[].
// The SectionStoreState expects Section[].
// I'll need to map it to add status if missing, or update MOCK_SECTIONS in shared to have status.
// A simpler way:

export const MOCK_SECTIONS_LOCAL = MOCK_SECTIONS.map(s => ({
    ...s,
    courseId: s.courseId!,
    status: "active" as const
}));

export const DEFAULT_SECTION_STORE_STATE: SectionStoreState = {
    sections: MOCK_SECTIONS_LOCAL,
};
