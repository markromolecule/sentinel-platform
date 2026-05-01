import { HTTPException } from 'hono/http-exception';
import { validateQuestionContentByType } from '../../assessment/assessment-contracts';
import { assertExamStructureInput } from './assert-exam-structure-input';
import type {
    ExamStructureQuestionInput,
    NormalizeExamStructureInputArgs,
} from './exam-service.types';

export function normalizeExamStructureInput(args: NormalizeExamStructureInputArgs) {
    assertExamStructureInput({
        questionSections: args.questionSections,
        questions: args.questions,
    });

    const questionSections = args.questionSections ?? [];
    const questions = args.questions ?? [];

    const normalizedSections = questionSections.map((section, index) => ({
        exam_section_id: section.id ?? crypto.randomUUID(),
        exam_id: args.examId,
        title: section.title,
        description: section.description?.trim() || null,
        order_index: section.orderIndex ?? index,
        created_at: new Date(),
        updated_at: new Date(),
    }));

    const validSectionIds = new Set(normalizedSections.map((section) => section.exam_section_id));

    const normalizedQuestions = questions.map((question, index) => {
        if (question.sectionId && !validSectionIds.has(question.sectionId)) {
            throw new HTTPException(400, {
                message: `Question section ${question.sectionId} does not exist in the submitted exam structure.`,
            });
        }

        return {
            question_id: question.id ?? crypto.randomUUID(),
            exam_id: args.examId,
            exam_section_id: question.sectionId ?? null,
            source_question_bank_question_id: question.sourceQuestionBankQuestionId ?? null,
            source_collection_id: question.sourceCollectionId ?? null,
            question_type: question.type,
            content: validateQuestionContentByType(question.type, question.content),
            points: question.points,
            order_index: question.orderIndex ?? index,
            created_at: new Date(),
            updated_at: new Date(),
        };
    });

    return {
        normalizedSections,
        normalizedQuestions,
    };
}

export function mapExamStructureQuestionInput(question: {
    question_id: string;
    exam_section_id: string | null;
    source_question_bank_question_id: string | null;
    source_collection_id: string | null;
    question_type: string;
    points: number;
    order_index: number;
    content: unknown;
}): ExamStructureQuestionInput {
    return {
        id: question.question_id,
        sectionId: question.exam_section_id,
        sourceQuestionBankQuestionId: question.source_question_bank_question_id,
        sourceCollectionId: question.source_collection_id,
        type: question.question_type as ExamStructureQuestionInput['type'],
        points: question.points,
        orderIndex: question.order_index,
        content: question.content as ExamStructureQuestionInput['content'],
    };
}
