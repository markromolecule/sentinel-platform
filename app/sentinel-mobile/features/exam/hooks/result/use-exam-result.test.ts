import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useExamResult } from './use-exam-result';

let stateValues: any[] = [];
let stateIndex = 0;
let effectCallbacks: Array<() => void | (() => void)> = [];

vi.mock('react', () => {
    return {
        useState: (initialValue: any) => {
            const currentIndex = stateIndex;
            if (stateValues[currentIndex] === undefined) {
                stateValues[currentIndex] = initialValue;
            }
            const value = stateValues[currentIndex];
            const setValue = (newValue: any) => {
                if (typeof newValue === 'function') {
                    stateValues[currentIndex] = newValue(stateValues[currentIndex]);
                } else {
                    stateValues[currentIndex] = newValue;
                }
            };
            stateIndex++;
            return [value, setValue];
        },
        useEffect: (callback: () => void | (() => void)) => {
            effectCallbacks.push(callback);
        },
        useCallback: (fn: any) => fn,
        useMemo: (fn: any) => fn(),
        useRef: (initial: any) => ({ current: initial }),
    };
});

const mockAlert = vi.fn();
const mockReplace = vi.fn();
const mockCompleteSession = vi.fn();
const mockClearPreview = vi.fn();
const mockClearSession = vi.fn();
const mockReadPreview = vi.fn();
const mockUseExamQuery = vi.fn((id?: string, params?: any) => ({
    data: { id: 'exam-123', title: 'Sample Exam', questions: [{ id: 'q-1' }] },
}));

vi.mock('expo-router', () => ({
    useRouter: () => ({ replace: mockReplace }),
    useLocalSearchParams: () => ({ id: 'exam-123' }),
}));

vi.mock('react-native', () => ({
    useColorScheme: () => 'light',
    Alert: { alert: (...args: any[]) => mockAlert(...args) },
    Platform: {
        OS: 'ios',
        select: (obj: any) => obj.ios || obj.default,
    },
}));

vi.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

vi.mock('@sentinel/hooks', () => ({
    useApi: () => vi.fn(),
    useExamQuery: (...args: any[]) => mockUseExamQuery(...args),
}));

vi.mock('@sentinel/services', () => ({
    completeExamSession: (...args: any[]) => mockCompleteSession(...args),
}));

vi.mock('@/features/exam/lib/mobile-exam-adapter', () => ({
    adaptExamForMobile: (exam: any) => exam,
    adaptExamQuestionsForMobile: (exam: any) => exam?.questions ?? [],
}));

vi.mock('@/features/exam/lib/mobile-exam-storage', () => ({
    readStoredMobileExamPreview: (...args: any[]) => mockReadPreview(...args),
    clearStoredMobileExamPreview: (...args: any[]) => mockClearPreview(...args),
    clearStoredMobileExamSession: (...args: any[]) => mockClearSession(...args),
}));

describe('useExamResult', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        stateValues = [];
        stateIndex = 0;
        effectCallbacks = [];

        mockReadPreview.mockResolvedValue({
            sessionId: 'session-456',
            answers: { 'q-1': 'A' },
            elapsedSeconds: 120,
            summary: { score: 10, totalScore: 10, percentage: 100 },
        });
        mockCompleteSession.mockResolvedValue({ success: true });
        mockClearPreview.mockResolvedValue(undefined);
        mockClearSession.mockResolvedValue(undefined);
    });

    it('queries exam with viewer: "student" and adapts questions', () => {
        const result = useExamResult();
        expect(mockUseExamQuery).toHaveBeenCalledWith('exam-123', { viewer: 'student' });
        expect(result.questions).toEqual([{ id: 'q-1' }]);
    });

    it('navigates to the feedback screen with attemptId on successful turn in when not yet submitted', async () => {
        // Pre-populate state for preview (state index 0)
        stateValues[0] = {
            sessionId: 'session-456',
            answers: { 'q-1': 'A' },
            elapsedSeconds: 120,
            summary: { score: 10, totalScore: 10, percentage: 100 },
        };
        stateValues[1] = false; // isTurningIn

        const result = useExamResult();
        await result.handleTurnIn();

        expect(mockCompleteSession).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                sessionId: 'session-456',
            }),
        );
        expect(mockClearPreview).toHaveBeenCalledWith('exam-123');
        expect(mockClearSession).toHaveBeenCalledWith('exam-123');
        expect(mockReplace).toHaveBeenCalledWith({
            pathname: '/exam/[id]/feedback',
            params: { id: 'exam-123', attemptId: 'session-456' },
        });
    });

    it('skips completeExamSession call if preview.completedAt is already present', async () => {
        stateValues[0] = {
            sessionId: 'session-456',
            answers: { 'q-1': 'A' },
            elapsedSeconds: 120,
            summary: { score: 10, totalScore: 10, percentage: 100 },
            completedAt: '2026-09-09T11:35:00.000Z',
        };
        stateValues[1] = false;

        const result = useExamResult();
        await result.handleTurnIn();

        expect(mockCompleteSession).not.toHaveBeenCalled();
        expect(mockClearPreview).toHaveBeenCalledWith('exam-123');
        expect(mockClearSession).toHaveBeenCalledWith('exam-123');
        expect(mockReplace).toHaveBeenCalledWith({
            pathname: '/exam/[id]/feedback',
            params: { id: 'exam-123', attemptId: 'session-456' },
        });
    });

    it('skips completeExamSession call if preview.summary.completedAt is already present', async () => {
        stateValues[0] = {
            sessionId: 'session-456',
            answers: { 'q-1': 'A' },
            elapsedSeconds: 120,
            summary: {
                score: 10,
                totalScore: 10,
                percentage: 100,
                completedAt: '2026-09-09T11:35:00.000Z',
            },
        };
        stateValues[1] = false;

        const result = useExamResult();
        await result.handleTurnIn();

        expect(mockCompleteSession).not.toHaveBeenCalled();
        expect(mockClearPreview).toHaveBeenCalledWith('exam-123');
        expect(mockClearSession).toHaveBeenCalledWith('exam-123');
        expect(mockReplace).toHaveBeenCalledWith({
            pathname: '/exam/[id]/feedback',
            params: { id: 'exam-123', attemptId: 'session-456' },
        });
    });

    it('intercepts "already been submitted" error and seamlessly routes to feedback without alert', async () => {
        mockCompleteSession.mockRejectedValue(
            new Error('This exam session has already been submitted.'),
        );

        stateValues[0] = {
            sessionId: 'session-456',
            answers: { 'q-1': 'A' },
            elapsedSeconds: 120,
            summary: { score: 10, totalScore: 10, percentage: 100 },
        };
        stateValues[1] = false;

        const result = useExamResult();
        await result.handleTurnIn();

        expect(mockCompleteSession).toHaveBeenCalled();
        expect(mockAlert).not.toHaveBeenCalled();
        expect(mockClearPreview).toHaveBeenCalledWith('exam-123');
        expect(mockClearSession).toHaveBeenCalledWith('exam-123');
        expect(mockReplace).toHaveBeenCalledWith({
            pathname: '/exam/[id]/feedback',
            params: { id: 'exam-123', attemptId: 'session-456' },
        });
    });

    it('intercepts 409 status code error and seamlessly routes to feedback without alert', async () => {
        mockCompleteSession.mockRejectedValue({ status: 409, message: 'Conflict' });

        stateValues[0] = {
            sessionId: 'session-456',
            answers: { 'q-1': 'A' },
            elapsedSeconds: 120,
            summary: { score: 10, totalScore: 10, percentage: 100 },
        };
        stateValues[1] = false;

        const result = useExamResult();
        await result.handleTurnIn();

        expect(mockCompleteSession).toHaveBeenCalled();
        expect(mockAlert).not.toHaveBeenCalled();
        expect(mockClearPreview).toHaveBeenCalledWith('exam-123');
        expect(mockClearSession).toHaveBeenCalledWith('exam-123');
        expect(mockReplace).toHaveBeenCalledWith({
            pathname: '/exam/[id]/feedback',
            params: { id: 'exam-123', attemptId: 'session-456' },
        });
    });

    it('displays error alert on unexpected turn-in error', async () => {
        mockCompleteSession.mockRejectedValue(new Error('Network disconnected'));

        stateValues[0] = {
            sessionId: 'session-456',
            answers: { 'q-1': 'A' },
            elapsedSeconds: 120,
            summary: { score: 10, totalScore: 10, percentage: 100 },
        };
        stateValues[1] = false;

        const result = useExamResult();
        await result.handleTurnIn();

        expect(mockCompleteSession).toHaveBeenCalled();
        expect(mockAlert).toHaveBeenCalledWith('Turn-in failed', 'Network disconnected');
        expect(mockReplace).not.toHaveBeenCalled();
    });

    it('does nothing when preview is null', async () => {
        stateValues[0] = null;
        stateValues[1] = false;

        const result = useExamResult();
        await result.handleTurnIn();

        expect(mockCompleteSession).not.toHaveBeenCalled();
        expect(mockReplace).not.toHaveBeenCalled();
    });
});
