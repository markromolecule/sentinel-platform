import { create, StateCreator } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { AdminSection as Section, SectionStoreState } from '@sentinel/shared/types';
import { DEFAULT_SECTION_STORE_STATE } from '@sentinel/shared/constants';

export type SectionStoreActions = {
    addSection: (section: Omit<Section, 'id' | 'createdAt' | 'createdBy'>) => void;
    updateSection: (id: string, updates: Partial<Section>) => void;
    deleteSection: (id: string) => void;
};

export type SectionStore = SectionStoreState & SectionStoreActions;

export const useSectionStore = create<SectionStore>()(
    immer((set) => ({
        ...DEFAULT_SECTION_STORE_STATE,

        addSection: (sectionData: Omit<Section, 'id' | 'createdAt' | 'createdBy'>) => {
            set((state: SectionStore) => {
                const newSection = {
                    ...sectionData,
                    id: crypto.randomUUID(),
                    createdAt: new Date().toISOString(),
                    createdBy: 'Admin',
                } as unknown as Section;
                state.sections.push(newSection);
            });
        },

        updateSection: (id: string, updates: Partial<Section>) => {
            set((state: SectionStore) => {
                const index = state.sections.findIndex((s: Section) => s.id === id);
                if (index !== -1) {
                    state.sections[index] = { ...state.sections[index], ...updates };
                }
            });
        },

        deleteSection: (id: string) => {
            set((state: SectionStore) => {
                state.sections = state.sections.filter((s: Section) => s.id !== id);
            });
        },
    })) as StateCreator<SectionStore, [], []>,
);
