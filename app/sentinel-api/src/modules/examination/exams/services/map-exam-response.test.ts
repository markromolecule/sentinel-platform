import { describe, expect, it } from 'vitest';
import { DEFAULT_TELEMETRY_SETTINGS } from '@sentinel/shared';
import { mapExamDetailResponse } from './map-exam-response';

function createRawExamRecord() {
    return {
        exam_id: 'exam-1',
        title: 'MediaPipe exam',
        description: 'Exam description',
        duration_minutes: 60,
        passing_score: 75,
        status: 'PUBLISHED',
        subject_id: 'subject-1',
        subject_title: 'Science',
        class_group_id: null,
        class_name: null,
        section_id: null,
        assigned_section_ids: [],
        assigned_section_names: [],
        section_name: null,
        linked_section_name: null,
        room_id: null,
        room_name: null,
        scheduled_date: new Date('2099-04-17T01:00:00.000Z'),
        end_date_time: new Date('2099-04-17T02:00:00.000Z'),
        published_at: new Date('2099-04-16T01:00:00.000Z'),
        question_count: 0,
        created_at: new Date('2099-04-15T01:00:00.000Z'),
        updated_at: new Date('2099-04-16T01:00:00.000Z'),
        attempt_id: null,
        attempt_status: null,
        attempt_completed_at: null,
        attempt_score: null,
        attempt_total_score: null,
        attempt_time_spent_minutes: null,
        attempt_incident_count: 0,
        attempt_primary_incident_type: null,
        attempt_answered_count: 0,
    };
}

function createExamConfiguration() {
    return {
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
    } as const;
}

describe('mapExamDetailResponse', () => {
    it('keeps mediaPipeSandbox on the mapped student exam detail payload', () => {
        const mediaPipeSandbox = {
            ...DEFAULT_TELEMETRY_SETTINGS.mediaPipeSandbox,
            enabled: true,
            captureDuringCheckup: true,
            emitDuringExam: true,
            calibrationRequired: true,
        };

        const detail = mapExamDetailResponse({
            exam: createRawExamRecord(),
            settings: {
                shuffleQuestions: false,
                showCorrectAnswers: false,
                allowReview: true,
                randomizeChoices: false,
            },
            configuration: createExamConfiguration(),
            mediaPipeSandbox,
            questionSections: [],
            questions: [],
            studentView: true,
        });

        expect(detail.mediaPipeSandbox).toEqual(mediaPipeSandbox);
    });
});
