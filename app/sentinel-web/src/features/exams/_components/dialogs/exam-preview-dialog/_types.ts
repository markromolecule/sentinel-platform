import { Exam } from '@sentinel/shared/types';

export type QuestionType =
    | 'MULTIPLE_CHOICE'
    | 'MULTIPLE_RESPONSE'
    | 'TRUE_FALSE'
    | 'IDENTIFICATION'
    | 'ESSAY'
    | 'FILL_BLANK'
    | 'MATCHING'
    | 'ENUMERATION';

export type AnswerValue =
    | string
    | number
    | boolean
    | (string | number)[]
    | Record<string, string>
    | null
    | undefined;

export interface BaseQuestionProps {
    question: NonNullable<Exam['questions']>[number];
    selectedAnswer: AnswerValue;
    onAnswerChange: (answer: AnswerValue) => void;
    previewMode: 'web' | 'mobile';
}
