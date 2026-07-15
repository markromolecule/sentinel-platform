import { describe, expect, it, vi } from 'vitest';
import { UnrecoverableError } from 'bullmq';
import { getAnswerKeySource, mapAnswerKeySourceToViewModel } from './get-answer-key-source';

// ─── Mock Builders ────────────────────────────────────────────────────────────

/**
 * Builds a Kysely double-leftJoin exam lookup stub that resolves to `examRow`.
 * .selectFrom('exams').leftJoin('subjects').leftJoin('institutions').select().where().executeTakeFirst()
 */
function buildExamLookupStub(examRow: any) {
    const whereMock = { executeTakeFirst: vi.fn().mockResolvedValue(examRow) };
    const selectMock = { where: () => whereMock };
    const joinInst = { select: () => selectMock };
    const joinSubj = { leftJoin: () => joinInst };
    return { leftJoin: () => joinSubj };
}

/**
 * Builds a Kysely exam-questions query stub.
 * .selectFrom('exam_questions').leftJoin('question_bank_questions').select().where().orderBy().execute()
 */
function buildQuestionLookupStub(rows: any[]) {
    const orderByMock = { execute: vi.fn().mockResolvedValue(rows) };
    const whereMock = { orderBy: () => orderByMock };
    const selectMock = { where: () => whereMock };
    const joinMock = { select: () => selectMock };
    return { leftJoin: () => joinMock };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('getAnswerKeySource', () => {
    it('throws UnrecoverableError when exam is not found', async () => {
        const mockDb = {
            selectFrom: vi.fn().mockReturnValue(buildExamLookupStub(undefined)),
        } as any;

        await expect(getAnswerKeySource(mockDb, 'exam-uuid', 'inst-uuid')).rejects.toThrow(UnrecoverableError);
    });

    it('throws UnrecoverableError when exam belongs to a different institution', async () => {
        const mockExam = {
            exam_id: 'exam-uuid',
            title: 'Algebra Midterm',
            duration_minutes: 90,
            difficulty: 'MEDIUM',
            passing_score: 75,
            institution_id: 'other-institution',
            subject_code: 'MATH-101',
            subject_name: 'Mathematics',
            institution_name: 'Other School',
        };

        const mockDb = {
            selectFrom: vi.fn().mockReturnValue(buildExamLookupStub(mockExam)),
        } as any;

        await expect(getAnswerKeySource(mockDb, 'exam-uuid', 'inst-uuid')).rejects.toThrow(UnrecoverableError);
    });

    it('returns mapped questions with correct answers for MULTIPLE_CHOICE', async () => {
        const mockExam = {
            exam_id: 'exam-123',
            title: 'Final Exam',
            duration_minutes: 120,
            difficulty: 'HARD',
            passing_score: 80,
            institution_id: 'inst-abc',
            subject_code: 'CS-101',
            subject_name: 'Computer Science',
            institution_name: 'Test University',
        };

        const mockQuestions = [
            {
                question_id: 'q-1',
                question_type: 'MULTIPLE_CHOICE',
                content: JSON.stringify({
                    text: 'What is 2+2?',
                    options: [
                        { optionId: 'a', optionText: '3', isCorrect: false },
                        { optionId: 'b', optionText: '4', isCorrect: true },
                    ],
                }),
                passage_content: null,
                points: 5,
                order_index: 1,
            },
        ];

        const mockDb = {
            selectFrom: vi.fn()
                .mockReturnValueOnce(buildExamLookupStub(mockExam))
                .mockReturnValueOnce(buildQuestionLookupStub(mockQuestions)),
        } as any;

        const result = await getAnswerKeySource(mockDb, 'exam-123', 'inst-abc');

        expect(result.examId).toBe('exam-123');
        expect(result.institutionId).toBe('inst-abc');
        expect(result.examTitle).toBe('Final Exam');
        expect(result.subjectCode).toBe('CS-101');
        expect(result.questions).toHaveLength(1);
        expect(result.questions[0].type).toBe('MULTIPLE_CHOICE');
        expect(result.questions[0].options).toHaveLength(2);
        // Correct answer flag must be present in the output — sanitization must NOT run
        expect(result.questions[0].options?.[1].isCorrect).toBe(true);
    });

    it('returns trueFalseAnswer from content for TRUE_FALSE questions', async () => {
        const mockExam = {
            exam_id: 'exam-tf',
            title: 'TF Exam',
            duration_minutes: 30,
            difficulty: 'EASY',
            passing_score: 60,
            institution_id: 'inst-abc',
            subject_code: 'GEN-001',
            subject_name: 'General',
            institution_name: 'School',
        };

        const mockQuestions = [
            {
                question_id: 'q-tf',
                question_type: 'TRUE_FALSE',
                content: JSON.stringify({ text: 'The sky is blue.', trueFalseAnswer: true }),
                passage_content: null,
                points: 2,
                order_index: 1,
            },
        ];

        const mockDb = {
            selectFrom: vi.fn()
                .mockReturnValueOnce(buildExamLookupStub(mockExam))
                .mockReturnValueOnce(buildQuestionLookupStub(mockQuestions)),
        } as any;

        const result = await getAnswerKeySource(mockDb, 'exam-tf', 'inst-abc');
        expect(result.questions[0].trueFalseAnswer).toBe(true);
    });

    it('returns blankAnswers from content for FILL_IN_BLANK questions', async () => {
        const mockExam = {
            exam_id: 'exam-fib',
            title: 'FIB Exam',
            duration_minutes: 45,
            difficulty: 'MEDIUM',
            passing_score: 65,
            institution_id: 'inst-abc',
            subject_code: 'ENG-201',
            subject_name: 'English',
            institution_name: 'School',
        };

        const mockQuestions = [
            {
                question_id: 'q-fib',
                question_type: 'FILL_IN_BLANK',
                content: JSON.stringify({ text: 'The capital is ___', blankAnswers: ['Manila'] }),
                passage_content: null,
                points: 3,
                order_index: 1,
            },
        ];

        const mockDb = {
            selectFrom: vi.fn()
                .mockReturnValueOnce(buildExamLookupStub(mockExam))
                .mockReturnValueOnce(buildQuestionLookupStub(mockQuestions)),
        } as any;

        const result = await getAnswerKeySource(mockDb, 'exam-fib', 'inst-abc');
        expect(result.questions[0].blankAnswers).toEqual(['Manila']);
    });
});

describe('mapAnswerKeySourceToViewModel', () => {
    it('maps AnswerKeySource to ExamAnswerKeyData view model', () => {
        const source = {
            examId: 'exam-1',
            institutionId: 'inst-1',
            examTitle: 'History Final',
            subjectCode: 'HIST-201',
            subjectName: 'World History',
            durationMinutes: 60,
            difficulty: 'MEDIUM',
            passingScore: 70,
            institutionName: 'History College',
            questions: [],
        };

        const vm = mapAnswerKeySourceToViewModel(source, 'Admin User');

        expect(vm.examId).toBe('exam-1');
        expect(vm.title).toBe('History Final');
        expect(vm.subjectCode).toBe('HIST-201');
        expect(vm.institutionName).toBe('History College');
        expect(vm.generatedBy).toBe('Admin User');
        expect(vm.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('defaults generatedBy to Sentinel Support when not provided', () => {
        const source = {
            examId: 'exam-2',
            institutionId: 'inst-2',
            examTitle: 'Quiz 1',
            subjectCode: 'GEN-101',
            subjectName: 'General',
            durationMinutes: 30,
            difficulty: 'EASY',
            passingScore: 50,
            institutionName: 'Test School',
            questions: [],
        };

        const vm = mapAnswerKeySourceToViewModel(source);
        expect(vm.generatedBy).toBe('Sentinel Support');
    });
});
