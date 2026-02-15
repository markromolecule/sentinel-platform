import { Section as SharedSection } from "@sentinel/shared/src/types";

export type SectionStatus = "active" | "archived" | "inactive";

export interface Section extends Omit<SharedSection, "status"> {
    status: SectionStatus;
    // Ensure compatibility or override if needed
    courseId: string; // Enforce required for frontend
}

export type SectionStoreState = {
    sections: Section[];
};
