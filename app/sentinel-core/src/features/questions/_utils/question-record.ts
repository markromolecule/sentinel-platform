import type { QuestionRecord } from '@sentinel/services';
import type { ExamQuestion } from '@sentinel/shared/types';

export function mapQuestionRecordToExamQuestion(record: QuestionRecord): ExamQuestion {
    return {
        id: record.id,
        examId: '',
        sourceOrigin: record.sourceOrigin,
        sourceFileName: record.sourceFileName,
        sourcePageNumber: record.sourcePageNumber,
        sourceEvidence: record.sourceEvidence,
        passageContent: record.passageContent,
        passageType: record.passageType,
        type: record.type,
        difficulty: record.difficulty,
        points: record.points,
        orderIndex: 0,
        tags: record.tags || [],
        content: record.content,
    };
}
