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
        lobbyAdmissionMode: 'AUTOMATIC',
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

    it('preserves section descriptions on the mapped exam detail payload', () => {
        const detail = mapExamDetailResponse({
            exam: createRawExamRecord(),
            settings: {
                shuffleQuestions: false,
                showCorrectAnswers: false,
                allowReview: true,
                randomizeChoices: false,
            },
            configuration: createExamConfiguration(),
            mediaPipeSandbox: DEFAULT_TELEMETRY_SETTINGS.mediaPipeSandbox,
            questionSections: [
                {
                    id: 'section-1',
                    title: 'Essay',
                    description: 'Write your answers in paragraph form.',
                    orderIndex: 0,
                },
            ],
            questions: [],
        });

        expect(detail.questionSections).toEqual([
            {
                id: 'section-1',
                title: 'Essay',
                description: 'Write your answers in paragraph form.',
                orderIndex: 0,
            },
        ]);
    });

    it('maps assignedRoomNames and assignedInstructorNames as empty arrays when raw record has no assignments', () => {
        const detail = mapExamDetailResponse({
            exam: {
                ...createRawExamRecord(),
                assigned_room_names: null,
                assigned_instructor_names: null,
            },
            settings: {
                shuffleQuestions: false,
                showCorrectAnswers: false,
                allowReview: true,
                randomizeChoices: false,
            },
            configuration: createExamConfiguration(),
            mediaPipeSandbox: DEFAULT_TELEMETRY_SETTINGS.mediaPipeSandbox,
            questionSections: [],
            questions: [],
        });

        // Must be empty arrays, not null/undefined, so UI can safely use .length
        expect(detail.assignedRoomNames).toEqual([]);
        expect(detail.assignedInstructorNames).toEqual([]);
    });

    it('maps assignedRoomNames and assignedInstructorNames correctly when assignments exist', () => {
        const detail = mapExamDetailResponse({
            exam: {
                ...createRawExamRecord(),
                assigned_room_names: ['ROOM101', 'ROOM201'],
                assigned_instructor_names: ['Juan dela Cruz', 'Maria Santos'],
            },
            settings: {
                shuffleQuestions: false,
                showCorrectAnswers: false,
                allowReview: true,
                randomizeChoices: false,
            },
            configuration: createExamConfiguration(),
            mediaPipeSandbox: DEFAULT_TELEMETRY_SETTINGS.mediaPipeSandbox,
            questionSections: [],
            questions: [],
        });

        expect(detail.assignedRoomNames).toEqual(['ROOM101', 'ROOM201']);
        expect(detail.assignedInstructorNames).toEqual(['Juan dela Cruz', 'Maria Santos']);
    });

    it('maps assign-first classroom relationships into singular and plural classroom fields', () => {
        const detail = mapExamDetailResponse({
            exam: {
                ...createRawExamRecord(),
                assigned_class_group_ids: ['classroom-1'],
                assigned_class_group_names: ['GEETH01X INF232'],
            },
            settings: {
                shuffleQuestions: false,
                showCorrectAnswers: false,
                allowReview: true,
                randomizeChoices: false,
            },
            configuration: createExamConfiguration(),
            mediaPipeSandbox: DEFAULT_TELEMETRY_SETTINGS.mediaPipeSandbox,
            questionSections: [],
            questions: [],
        });

        expect(detail.classroomId).toBe('classroom-1');
        expect(detail.classroomIds).toEqual(['classroom-1']);
        expect(detail.classroomName).toBe('GEETH01X INF232');
        expect(detail.classroomNames).toEqual(['GEETH01X INF232']);
    });

    it('maps isPublic, createdByName, and publishedByName correctly', () => {
        const detail = mapExamDetailResponse({
            exam: {
                ...createRawExamRecord(),
                is_public: true,
                created_by_name: 'Creator John',
                published_by_name: 'Publisher Jane',
            },
            settings: {
                shuffleQuestions: false,
                showCorrectAnswers: false,
                allowReview: true,
                randomizeChoices: false,
            },
            configuration: createExamConfiguration(),
            mediaPipeSandbox: DEFAULT_TELEMETRY_SETTINGS.mediaPipeSandbox,
            questionSections: [],
            questions: [],
        });

        expect(detail.isPublic).toBe(true);
        expect(detail.createdByName).toBe('Creator John');
        expect(detail.publishedByName).toBe('Publisher Jane');
    });

    it('maps passage fields on exam questions', () => {
        const detail = mapExamDetailResponse({
            exam: createRawExamRecord(),
            settings: {
                shuffleQuestions: false,
                showCorrectAnswers: false,
                allowReview: true,
                randomizeChoices: false,
            },
            configuration: createExamConfiguration(),
            mediaPipeSandbox: DEFAULT_TELEMETRY_SETTINGS.mediaPipeSandbox,
            questionSections: [],
            questions: [
                {
                    id: 'question-1',
                    examId: 'exam-1',
                    sectionId: null,
                    sourceQuestionBankQuestionId: null,
                    sourceCollectionId: null,
                    sourceOrigin: 'MANUAL',
                    sourceFileName: null,
                    sourcePageNumber: null,
                    sourceEvidence: null,
                    passageContent: '<p>Passage</p>',
                    passageType: 'html',
                    type: 'ESSAY',
                    points: 5,
                    orderIndex: 0,
                    tags: [],
                    content: { prompt: 'Explain' },
                },
            ],
        });

        expect(detail.questions[0]?.passageContent).toBe('<p>Passage</p>');
        expect(detail.questions[0]?.passageType).toBe('html');
    });
});
