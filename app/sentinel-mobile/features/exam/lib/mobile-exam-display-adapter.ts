import { resolveStudentExamStatus } from '@sentinel/shared';
import type { Exam, StudentExamStatus } from '@sentinel/shared/types';
import type { MobileDifficulty, MobileExamDisplay } from './mobile-exam-adapter.types';
import { resolveStudentExamMediaPipeSandbox } from './mobile-exam-mediapipe-adapter';

const DEFAULT_INSTRUCTIONS = [
    'Review the privacy and readiness steps before joining the live session.',
    'Stay inside the app while the exam is active.',
    'Keep camera and microphone access available when required.',
    'Submit your answers before the timer ends.',
];

export function toDisplayDifficulty(value?: Exam['difficulty']): MobileDifficulty {
    switch (value) {
        case 'easy':
            return 'Easy';
        case 'hard':
            return 'Hard';
        case 'medium':
        default:
            return 'Medium';
    }
}

export function buildInstructions(exam: Exam): string[] {
    const instructions = [...DEFAULT_INSTRUCTIONS];

    if (exam.configuration?.lobbyAdmissionMode === 'INSTRUCTOR_GATED') {
        instructions.unshift('Wait for instructor approval in the lobby before entering.');
    }

    if (exam.configuration?.mobileSecurity?.prevent_backgrounding) {
        instructions.push('Backgrounding the app may be flagged by the proctoring policy.');
    }

    return instructions;
}

/**
 * Resolves the student-facing status of an exam on mobile.
 * Normalizes completed attempts or explicit turned_in/completed flags to 'turned_in',
 * and computes dynamic student status (upcoming, available, past_due, archived, in-progress)
 * based on schedule and attempt dates.
 */
export function resolveMobileExamStatus(exam: Exam): StudentExamStatus {
    const attemptStatus = (exam as any).attempt_status || (exam as any).attemptStatus;
    const completedAt = exam.completedAt || (exam as any).attemptCompletedAt;

    if (
        completedAt ||
        attemptStatus === 'COMPLETED' ||
        attemptStatus === 'completed' ||
        exam.status === 'turned_in' ||
        exam.status === 'completed'
    ) {
        return 'turned_in';
    }

    return resolveStudentExamStatus({
        status: exam.status,
        scheduledDate:
            exam.scheduledDate || (exam as any).startDate || (exam as any).scheduledStartDate,
        endDateTime: exam.endDateTime,
        durationMinutes: exam.duration,
        attemptCompletedAt: completedAt,
        attemptStatus: attemptStatus === 'in-progress' ? 'in-progress' : (attemptStatus ?? null),
    });
}

/**
 * Converts a raw API exam object into a lightweight display model for the
 * mobile exam list and lobby screens, automatically resolving MediaPipe sandbox settings
 * and normalizing student exam status.
 */
export function adaptExamForMobile(exam: Exam): MobileExamDisplay {
    const questionCount =
        exam.questionCount ??
        (Array.isArray(exam.questions) ? exam.questions.length : 0);

    const resolvedMediaPipeSandbox = resolveStudentExamMediaPipeSandbox({
        configuration: exam.configuration,
        mediaPipeSandbox: exam.mediaPipeSandbox,
    });

    const rawQuestions = Array.isArray(exam.questions)
        ? exam.questions
        : Array.isArray((exam as any).rawQuestions)
            ? (exam as any).rawQuestions
            : [];

    return {
        ...exam,
        status: resolveMobileExamStatus(exam),
        mediaPipeSandbox: resolvedMediaPipeSandbox,
        professor: exam.professor || 'Instructor',
        questions: questionCount,
        rawQuestions,
        passingPercentage: exam.passingScore,
        difficulty: toDisplayDifficulty(exam.difficulty),
        instructions: buildInstructions(exam),
        startDate:
            exam.scheduledDate || (exam as any).startDate || (exam as any).scheduledStartDate,
        scheduledStartDate:
            (exam as any).scheduledStartDate || exam.scheduledDate || (exam as any).startDate,
    };
}

