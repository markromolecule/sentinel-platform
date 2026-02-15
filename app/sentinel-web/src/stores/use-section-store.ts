import { create, StateCreator } from "zustand";
import { immer } from "zustand/middleware/immer";
import { Section, SectionStoreState } from "@/app/(protected)/admin/sections/_types";
import { DEFAULT_SECTION_STORE_STATE } from "@/app/(protected)/admin/sections/_constants";

export type SectionStoreActions = {

    addSection: (section: Omit<Section, "id" | "createdAt" | "createdBy" | "status">) => void;
    updateSection: (id: string, updates: Partial<Section>) => void;
    deleteSection: (id: string) => void;
};

export type SectionStore = SectionStoreState & SectionStoreActions;

export const useSectionStore = create<SectionStore>()(
    immer((set) => ({
        ...DEFAULT_SECTION_STORE_STATE,

        addSection: (sectionData: Omit<Section, "id" | "createdAt" | "createdBy" | "status">) => {
            set((state: SectionStore) => {
                const newSection: Section = {
                    id: crypto.randomUUID(),
                    ...sectionData,
                    status: "active",
                    createdAt: new Date().toISOString(),
                    createdBy: "Admin", 
                };
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
    })) as unknown as StateCreator<SectionStore, [], []>
);
