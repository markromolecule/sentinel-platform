import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SessionManagerService } from './services/session-manager.service';
import { AccessGatekeeperService } from '../access/services/access-gatekeeper.service';
import { SessionRepository } from './data/session.repository';
import { type DbClient } from '@sentinel/db';
import { getExamConfigurationState } from '../configuration/configuration.service';

// Mock dependencies
vi.mock('../access/services/access-gatekeeper.service');
vi.mock('./data/session.repository');
vi.mock('../configuration/configuration.service', () => ({
    getExamConfigurationState: vi.fn(),
}));

describe('Examination Flow Integration', () => {
    const mockDb = {} as DbClient;
    const studentId = 'student-123';
    const examId = 'exam-456';
    const accessStudentId = '5d380bbd-d078-4c92-ba87-6340509bb7f9';
    const configSnapshot = {
        settings: {
            shuffleQuestions: true,
            showCorrectAnswers: false,
            allowReview: false,
            randomizeChoices: true,
        },
        configuration: {
            maxReconnectAttempts: 3,
            strictMode: true,
            screenLock: true,
            cameraRequired: true,
            micRequired: true,
            autoSubmitTimeoutMinutes: 5,
            aiRules: {
                gaze_tracking: true,
                face_detection: true,
                audio_anomaly_detection: true,
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
                root_jailbreak_detection: true,
            },
        },
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(getExamConfigurationState).mockResolvedValue(configSnapshot);
    });

    it('denies session start if access gatekeeper determines student is ineligible', async () => {
        // Mock access rejection
        vi.mocked(AccessGatekeeperService.verifyStudentExamEligibility).mockResolvedValue({
            isEligible: false,
            reason: 'Student is not enrolled',
        });

        const result = await SessionManagerService.startSession(mockDb, studentId, examId);

        expect(result.error).toBe('Student is not enrolled');
        expect(result.sessionId).toBeUndefined();

        // Assert cross-domain integration
        expect(AccessGatekeeperService.verifyStudentExamEligibility).toHaveBeenCalledWith(
            mockDb,
            studentId,
            examId,
        );

        // Assert Flow halted before creating a session
        expect(SessionRepository.createSession).not.toHaveBeenCalled();
        expect(getExamConfigurationState).not.toHaveBeenCalled();
    });

    it('initializes session securely when access gatekeeper grants eligibility', async () => {
        const mockSessionId = 'session-uuid-789';

        // Mock access approval
        vi.mocked(AccessGatekeeperService.verifyStudentExamEligibility).mockResolvedValue({
            isEligible: true,
            context: {
                examId,
                studentId: accessStudentId,
                subjectId: 'subject-123',
                sectionId: null,
                roomId: null,
                durationMinutes: 60,
                scheduledDate: new Date().toISOString(),
                endDateTime: new Date(Date.now() + 60_000).toISOString(),
                status: 'PUBLISHED',
                publishedAt: new Date().toISOString(),
                institutionId: 'institution-123',
            },
        });

        // Mock session repository
        vi.mocked(SessionRepository.createSession).mockResolvedValue({
            sessionId: mockSessionId,
            isResumed: false,
        });

        const result = await SessionManagerService.startSession(mockDb, studentId, examId);

        expect(result.error).toBeUndefined();
        expect(result.sessionId).toBe(mockSessionId);
        expect(result.configSnapshot).toEqual(configSnapshot);
        expect(result.isResumed).toBe(false);

        // Core requirement check: Flow securely depends on Access
        expect(AccessGatekeeperService.verifyStudentExamEligibility).toHaveBeenCalledWith(
            mockDb,
            studentId,
            examId,
        );
        expect(getExamConfigurationState).toHaveBeenCalledWith(mockDb, examId);
        expect(SessionRepository.createSession).toHaveBeenCalledWith(mockDb, {
            studentId: accessStudentId,
            examId,
            maxReconnectAttempts: configSnapshot.configuration.maxReconnectAttempts,
        });
    });
});
