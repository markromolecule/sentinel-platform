import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { GenerateQuestionPreviewResponse } from '@sentinel/shared';

type SaveTarget =
    | {
          mode: 'create_collection';
      }
    | {
          mode: 'append_to_collection';
          collectionId: string;
          collectionName?: string;
      };

interface AiImportState {
    previewData: GenerateQuestionPreviewResponse | null;
    isGenerating: boolean;
    isSaving: boolean;
    hasHydrated: boolean;
    saveTarget: SaveTarget;
    setPreviewData: (data: GenerateQuestionPreviewResponse | null) => void;
    setIsGenerating: (isGenerating: boolean) => void;
    setIsSaving: (isSaving: boolean) => void;
    setHasHydrated: (hasHydrated: boolean) => void;
    setSaveTarget: (target: SaveTarget) => void;
    updateQuestion: (
        index: number,
        updates: Partial<GenerateQuestionPreviewResponse['questions'][number]>,
    ) => void;
    reset: () => void;
}

export const useAiImportStore = create<AiImportState>()(
    persist(
        (set) => ({
            previewData: null,
            isGenerating: false,
            isSaving: false,
            hasHydrated: false,
            saveTarget: {
                mode: 'create_collection',
            },
            setPreviewData: (data) => set({ previewData: data }),
            setIsGenerating: (isGenerating) => set({ isGenerating }),
            setIsSaving: (isSaving) => set({ isSaving }),
            setHasHydrated: (hasHydrated) => set({ hasHydrated }),
            setSaveTarget: (saveTarget) => set({ saveTarget }),
            updateQuestion: (index, updates) =>
                set((state) => {
                    if (!state.previewData) return state;
                    const newQuestions = [...state.previewData.questions];
                    newQuestions[index] = { ...newQuestions[index], ...updates };
                    return {
                        previewData: {
                            ...state.previewData,
                            questions: newQuestions,
                            savePayload: {
                                ...state.previewData.savePayload,
                                questions: newQuestions,
                            },
                        },
                    };
                }),
            reset: () =>
                set({
                    previewData: null,
                    isGenerating: false,
                    saveTarget: {
                        mode: 'create_collection',
                    },
                }),
        }),
        {
            name: 'ai-import-preview',
            storage: createJSONStorage(() => sessionStorage),
            partialize: (state) => ({
                previewData: state.previewData,
                saveTarget: state.saveTarget,
            }),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        },
    ),
);
