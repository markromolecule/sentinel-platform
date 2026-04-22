'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useExamConfigurationQuery, useExamQuery } from '@sentinel/hooks';
import { DEFAULT_TELEMETRY_SETTINGS } from '@sentinel/shared';
import type {
    ExamConfiguration,
    ExamQuestion,
    ExamSettings,
    ProctorExam,
} from '@sentinel/shared/types';

const DEFAULT_SETTINGS: ExamSettings = {
    shuffleQuestions: false,
    showCorrectAnswers: false,
    allowReview: true,
    randomizeChoices: false,
};

const DEFAULT_CONFIGURATION: ExamConfiguration = {
    maxReconnectAttempts: 3,
    strictMode: true,
    screenLock: true,
    cameraRequired: true,
    micRequired: true,
    autoSubmitTimeoutMinutes: 5,
    aiRules: {
        gaze_tracking: true,
        face_detection: true,
        audio_anomaly_detection: false,
        multiple_faces_detection: true,
    },
    webSecurity: {
        tab_switching_monitor: true,
        full_screen_required: true,
        clipboard_control: true,
        right_click_disable: true,
        print_screen_disable: true,
    },
    mobileSecurity: {
        app_pinning_required: true,
        prevent_backgrounding: true,
        notification_block: true,
        screenshot_block: true,
        root_jailbreak_detection: false,
    },
};

function sortQuestions(exam: ProctorExam | null): ExamQuestion[] {
    if (!exam?.questions?.length) {
        return [];
    }

    return [...exam.questions].sort((left, right) => left.orderIndex - right.orderIndex);
}

export function useStudentExamData() {
    const params = useParams();
    const examId = params.id as string;
    const { data: exam, isLoading: isExamLoading } = useExamQuery(examId);
    const { data: configurationState, isLoading: isConfigurationLoading } =
        useExamConfigurationQuery(examId);

    const settings = configurationState?.settings ?? exam?.settings ?? DEFAULT_SETTINGS;
    const configuration =
        configurationState?.configuration ?? exam?.configuration ?? DEFAULT_CONFIGURATION;
    const questions = useMemo(() => sortQuestions(exam ?? null), [exam]);
    const mediaPipeSandbox =
        exam?.mediaPipeSandbox ?? DEFAULT_TELEMETRY_SETTINGS.mediaPipeSandbox;

    return {
        examId,
        exam: exam ?? null,
        settings,
        configuration,
        mediaPipeSandbox,
        questions,
        isLoading: isExamLoading || isConfigurationLoading,
    };
}
