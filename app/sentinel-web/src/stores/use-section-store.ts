import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { Section, SectionStoreState } from "@/app/(protected)/admin/sections/_types";
import { DEFAULT_SECTION_STORE_STATE } from "@/app/(protected)/admin/sections/_constants";

export type SectionStoreActions = {

    addSection: (section: Omit<Section, "id" | "createdAt" | "createdBy" | "status">) => void;
    updateSection: (id: string, updates: Partial<Section>) => void;
    deleteSection: (id: string) => void;
};

export type SectionStore = SectionStoreState & SectionStoreActions;

export const useSectionStore = create(
    immer<SectionStore>((set) => ({
        ...DEFAULT_SECTION_STORE_STATE,

        addSection: (sectionData) => {
            set((state) => {
                const newSection: Section = {
                    id: crypto.randomUUID(),
                    ...sectionData,
                    status: "active",
                    createdAt: new Date().toISOString(),
                    createdBy: "Admin", // TODO: Get current user
                };
                state.sections.push(newSection);
            });
        },

        updateSection: (id, updates) => {
            set((state) => {
                const index = state.sections.findIndex((s) => s.id === id);
                if (index !== -1) {
                    state.sections[index] = { ...state.sections[index], ...updates };
                }
            });
        },

        deleteSection: (id) => {
            set((state) => {
                state.sections = state.sections.filter((s) => s.id !== id);
            });
        },
    }))
);
