import type { ExamQuestionContent, QuestionType } from '@sentinel/shared/types';
import { questionContentSchemaByType } from '@sentinel/shared/schema';

export function isQuestionComplete(type: QuestionType, content: ExamQuestionContent): boolean {
    const schema = questionContentSchemaByType[type];
    if (!schema) return false;
    return schema.safeParse(content).success;
}

export function createDefaultContent(type: QuestionType): ExamQuestionContent {
    switch (type) {
        case 'MULTIPLE_CHOICE':
            return {
                prompt: '',
                options: ['', ''],
                correctAnswer: '',
            };
        case 'MULTIPLE_RESPONSE':
            return {
                prompt: '',
                options: ['', ''],
                correctAnswer: [],
            };
        case 'TRUE_FALSE':
            return {
                prompt: '',
                correctAnswer: true,
            };
        case 'IDENTIFICATION':
        case 'ENUMERATION':
            return {
                prompt: '',
                acceptedAnswers: [''],
            };
        case 'MATCHING':
            return {
                prompt: '',
                pairs: [{ left: '', right: '' }],
            };
        case 'FILL_BLANK':
            return {
                prompt: '',
                blanks: [''],
            };
        case 'ESSAY':
            return {
                prompt: '',
                rubric: '',
                maxLength: 1000,
            };
        default:
            return { prompt: '' };
    }
}
