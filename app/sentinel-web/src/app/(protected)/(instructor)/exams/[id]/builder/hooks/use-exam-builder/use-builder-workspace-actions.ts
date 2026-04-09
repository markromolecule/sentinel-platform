import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import {
    usePublishBuilderWorkspaceMutation,
    useSaveBuilderWorkspaceMutation,
    useUpdateExamMutation,
} from '@sentinel/hooks';
import { toast } from 'sonner';
import { BUILDER_QUERY_KEYS } from '@sentinel/shared/constants';
import {
    buildBuilderWorkspacePayload,
    useExamStore,
} from '@/features/exams/builder/_stores/use-exam-store';

import { type BuilderWorkspace } from '@sentinel/services';

interface UseBuilderWorkspaceActionsProps {
    id: string;
    builderWorkspace?: BuilderWorkspace;
}

export function useBuilderWorkspaceActions({
    id,
    builderWorkspace,
}: UseBuilderWorkspaceActionsProps) {
    const router = useRouter();
    const queryClient = useQueryClient();

    const saveBuilderWorkspaceMutation = useSaveBuilderWorkspaceMutation();
    const publishBuilderWorkspaceMutation = usePublishBuilderWorkspaceMutation();
    const updateExamMutation = useUpdateExamMutation({
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: BUILDER_QUERY_KEYS.workspace(id),
            });
        },
    });

    const { hydrateExam, setTitle, updateSetting, settings } = useExamStore();

    // Hydration logic
    useEffect(() => {
        if (builderWorkspace?.exam) {
            hydrateExam(builderWorkspace.exam);
        }
    }, [builderWorkspace?.exam, hydrateExam]);

    const handleToggleExamSetting = (key: keyof typeof settings, value: boolean) => {
        updateSetting(key, value);
    };

    const handleUpdateTitle = async (nextTitle: string) => {
        const examId = useExamStore.getState().examId ?? id;
        const trimmedTitle = nextTitle.trim();
        const currentTitle = useExamStore.getState().title;

        if (!examId) {
            toast.error('Exam not found.');
            return false;
        }

        if (!trimmedTitle) {
            toast.error('Exam title is required.');
            return false;
        }

        if (trimmedTitle.length < 4 || trimmedTitle.length > 100) {
            toast.error('Exam title must be between 4 and 100 characters.');
            return false;
        }

        if (trimmedTitle === currentTitle) {
            return true;
        }

        setTitle(trimmedTitle);

        try {
            await updateExamMutation.mutateAsync({
                id: examId,
                payload: {
                    title: trimmedTitle,
                },
            });
            return true;
        } catch {
            setTitle(currentTitle);
            return false;
        }
    };

    const handleSave = async () => {
        const examId = useExamStore.getState().examId ?? id;

        if (!examId) {
            toast.error('Exam not found.');
            return;
        }

        await saveBuilderWorkspaceMutation.mutateAsync({
            id: examId,
            payload: buildBuilderWorkspacePayload(useExamStore.getState()),
        });
        router.push('/exams');
    };

    const handlePublish = async () => {
        const examId = useExamStore.getState().examId ?? id;

        if (!examId) {
            toast.error('Exam not found.');
            return;
        }

        await publishBuilderWorkspaceMutation.mutateAsync(examId);
        router.push('/exams');
    };

    return {
        isSaving: saveBuilderWorkspaceMutation.isPending,
        isPublishing: publishBuilderWorkspaceMutation.isPending,
        isUpdatingTitle: updateExamMutation.isPending,
        handleToggleExamSetting,
        handleUpdateTitle,
        handleSave,
        handlePublish,
    };
}
