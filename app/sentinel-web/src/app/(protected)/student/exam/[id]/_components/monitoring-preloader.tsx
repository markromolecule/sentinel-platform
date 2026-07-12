'use client';

import { useEffect } from 'react';
import type { ExamConfig } from '@sentinel/shared/types';
import { useCheckupAudio } from './student-exam-audio-provider';
import { useStudentExamMediaPipeStream } from './student-exam-mediapipe-provider';

export type MonitoringPreloaderProps = {
    configuration?: ExamConfig;
};

/**
 * Background preloader that warms up monitoring workers and models.
 * Used in the lobby to ensure AI models are ready before the exam attempt starts.
 */
export function MonitoringPreloader({ configuration }: MonitoringPreloaderProps) {
    const { warmupAudioAnomaly } = useCheckupAudio();
    const { warmupMediaPipe } = useStudentExamMediaPipeStream();

    useEffect(() => {
        if (!configuration) return;

        // Warm up Audio Anomaly Detection if enabled
        if (configuration.aiRules?.audio_anomaly_detection) {
            warmupAudioAnomaly();
        }

        // Warm up MediaPipe Face Detection if enabled
        if (configuration.cameraRequired && configuration.aiRules?.face_detection) {
            void warmupMediaPipe();
        }
    }, [configuration, warmupAudioAnomaly, warmupMediaPipe]);

    return null;
}
