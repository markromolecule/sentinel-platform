import type { ExamQuestionContent, QuestionType } from '@sentinel/shared/types';

export function isQuestionComplete(type: QuestionType, content: ExamQuestionContent): boolean {
    if (!content.prompt?.trim()) return false;

    switch (type) {
        case 'MULTIPLE_CHOICE': {
            const options = content.options ?? [];
            if (options.length < 2 || options.some((option) => !option.trim())) return false;
            if (typeof content.correctAnswer !== 'string' || !content.correctAnswer.trim())
                return false;
            if (!options.includes(content.correctAnswer)) return false;
            return true;
        }
        case 'MULTIPLE_RESPONSE': {
            const options = content.options ?? [];
            if (options.length < 2 || options.some((option) => !option.trim())) return false;
            if (!Array.isArray(content.correctAnswer)) return false;
            const answers = (content.correctAnswer as string[]).filter((answer) => !!answer.trim());
            if (answers.length === 0) return false;
            if (answers.some((answer) => !options.includes(answer))) return false;
            return true;
        }
        case 'TRUE_FALSE': {
            return typeof content.correctAnswer === 'boolean';
        }
        case 'IDENTIFICATION':
        case 'ENUMERATION': {
            const answers = content.acceptedAnswers ?? [];
            return answers.length > 0 && answers.every((answer) => !!answer.trim());
        }
        case 'MATCHING': {
            const pairs = content.pairs ?? [];
            return (
                pairs.length > 0 && pairs.every((pair) => !!pair.left.trim() && !!pair.right.trim())
            );
        }
        case 'FILL_BLANK': {
            const blanks = content.blanks ?? [];
            return blanks.length > 0 && blanks.every((blank) => !!blank.trim());
        }
        case 'ESSAY': {
            return true; // prompt is already checked
        }
        default:
            return false;
    }
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
