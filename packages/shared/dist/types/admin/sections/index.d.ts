import { Section as SharedSection } from '../../index';
export type SectionStatus = 'active' | 'archived' | 'inactive';
export interface Section extends Omit<SharedSection, 'status'> {
    status: SectionStatus;
    courseId: string;
}
export type SectionStoreState = {
    sections: Section[];
};
//# sourceMappingURL=index.d.ts.map