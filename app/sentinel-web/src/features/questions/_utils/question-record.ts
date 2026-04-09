import type { QuestionRecord } from '@sentinel/services';
import type { ExamQuestion } from '@sentinel/shared/types';

export function mapQuestionRecordToExamQuestion(record: QuestionRecord): ExamQuestion {
    return {
        id: record.id,
        examId: '',
        type: record.type,
        difficulty: record.difficulty,
        points: record.points,
        orderIndex: 0,
        tags: record.tags || [],
        content: record.content,
    };
}
