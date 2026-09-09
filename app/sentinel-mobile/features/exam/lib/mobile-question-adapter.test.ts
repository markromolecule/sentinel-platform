import { describe, it, expect } from 'vitest';
import {
    parseQuestionContent,
    getQuestionPromptText,
    extractPassageDetails,
} from './mobile-question-parser';
import {
    getChoiceOptions,
    getTrueFalseOptions,
} from './mobile-question-options';
import { normalizeQuestionType } from './mobile-question-type';
import { adaptExamQuestionsForMobile } from './mobile-question-adapter';

describe('mobile-question-parser', () => {
    it('returns empty object for falsy inputs', () => {
        expect(parseQuestionContent(null)).toEqual({});
        expect(parseQuestionContent(undefined)).toEqual({});
        expect(parseQuestionContent('')).toEqual({});
    });

    it('parses valid stringified JSON content', () => {
        const jsonStr = JSON.stringify({ prompt: 'Test prompt', points: 2 });
        expect(parseQuestionContent(jsonStr)).toEqual({ prompt: 'Test prompt', points: 2 });
    });

    it('falls back to { prompt: string } for non-JSON strings', () => {
        expect(parseQuestionContent('Raw text content')).toEqual({ prompt: 'Raw text content' });
    });

    it('returns object content as-is', () => {
        const obj = { prompt: 'Object prompt', options: ['A', 'B'] };
        expect(parseQuestionContent(obj)).toBe(obj);
    });

    it('resolves question prompt text from various candidate keys', () => {
        expect(getQuestionPromptText({ prompt: 'Question Prompt' }, {})).toBe('Question Prompt');
        expect(getQuestionPromptText({}, { questionPrompt: 'Content Question Prompt' })).toBe('Content Question Prompt');
        expect(getQuestionPromptText({}, { question_text: 'Question Text' })).toBe('Question Text');
        expect(getQuestionPromptText(null, {})).toBe('');
    });

    it('extracts passage and passage title from fallback keys', () => {
        const details1 = extractPassageDetails(
            { passageContent: 'Passage body text', passageTitle: 'Reading Title' },
            {},
        );
        expect(details1.passage).toBe('Passage body text');
        expect(details1.passageTitle).toBe('Reading Title');

        const details2 = extractPassageDetails(
            {},
            { passage_text: 'Content passage', passage_header: 'Content Header' },
        );
        expect(details2.passage).toBe('Content passage');
        expect(details2.passageTitle).toBe('Content Header');

        const detailsEmpty = extractPassageDetails({}, {});
        expect(detailsEmpty.passage).toBeNull();
        expect(detailsEmpty.passageTitle).toBeNull();
    });
});

describe('mobile-question-options', () => {
    it('generates true/false options', () => {
        expect(getTrueFalseOptions()).toEqual([
            { id: 'true', text: 'True' },
            { id: 'false', text: 'False' },
        ]);
    });

    it('extracts choice options from string arrays with letter keys', () => {
        const options = getChoiceOptions({ options: ['Alpha', 'Beta', 'Gamma'] });
        expect(options).toEqual([
            { id: 'A', text: 'Alpha' },
            { id: 'B', text: 'Beta' },
            { id: 'C', text: 'Gamma' },
        ]);
    });

    it('extracts choice options from object arrays preserving existing IDs', () => {
        const options = getChoiceOptions({
            options: [
                { id: 'custom-1', text: 'Custom text 1' },
                { key: 'custom-2', label: 'Custom text 2' },
            ],
        });
        expect(options).toEqual([
            { id: 'custom-1', text: 'Custom text 1' },
            { id: 'custom-2', text: 'Custom text 2' },
        ]);
    });

    it('returns empty array when no valid options are present', () => {
        expect(getChoiceOptions({})).toEqual([]);
        expect(getChoiceOptions({ options: [] })).toEqual([]);
        expect(getChoiceOptions(null as any)).toEqual([]);
    });
});

describe('mobile-question-type', () => {
    it('normalizes common type aliases', () => {
        expect(normalizeQuestionType('MCQ')).toBe('MULTIPLE_CHOICE');
        expect(normalizeQuestionType('single_choice')).toBe('MULTIPLE_CHOICE');
        expect(normalizeQuestionType('multi_select')).toBe('MULTIPLE_RESPONSE');
        expect(normalizeQuestionType('checkboxes')).toBe('MULTIPLE_RESPONSE');
        expect(normalizeQuestionType('boolean')).toBe('TRUE_FALSE');
        expect(normalizeQuestionType('tf')).toBe('TRUE_FALSE');
        expect(normalizeQuestionType('short-answer')).toBe('IDENTIFICATION');
        expect(normalizeQuestionType('identify')).toBe('IDENTIFICATION');
        expect(normalizeQuestionType('list')).toBe('ENUMERATION');
        expect(normalizeQuestionType('fill-in-the-blank')).toBe('FILL_BLANK');
        expect(normalizeQuestionType('cloze')).toBe('FILL_BLANK');
        expect(normalizeQuestionType('match')).toBe('MATCHING');
        expect(normalizeQuestionType('long_answer')).toBe('ESSAY');
    });

    it('defaults to MULTIPLE_CHOICE for empty/undefined types', () => {
        expect(normalizeQuestionType(undefined)).toBe('MULTIPLE_CHOICE');
        expect(normalizeQuestionType(null)).toBe('MULTIPLE_CHOICE');
        expect(normalizeQuestionType('')).toBe('MULTIPLE_CHOICE');
    });
});

describe('mobile-question-adapter orchestration', () => {
    it('handles empty or non-array exam gracefully', () => {
        expect(adaptExamQuestionsForMobile(null)).toEqual([]);
        expect(adaptExamQuestionsForMobile(undefined)).toEqual([]);
        expect(adaptExamQuestionsForMobile({ questions: 12 } as any)).toEqual([]);
    });

    it('adapts questions from nested exam data formats', () => {
        const examData = {
            data: {
                questions: [
                    {
                        id: 'q-nested',
                        type: 'MULTIPLE_CHOICE',
                        content: { prompt: 'Nested prompt', options: ['1', '2'] },
                    },
                ],
            },
        };
        const adapted = adaptExamQuestionsForMobile(examData);
        expect(adapted).toHaveLength(1);
        expect(adapted[0].id).toBe('q-nested');
        expect(adapted[0].text).toBe('Nested prompt');
    });

    it('preserves sectionId and content properties on adapted questions', () => {
        const examData = {
            questions: [
                {
                    id: 'q-sec-1',
                    type: 'MULTIPLE_CHOICE',
                    sectionId: 'sec-part-1',
                    content: { prompt: 'Part 1 Question', options: ['A', 'B'] },
                },
                {
                    id: 'q-sec-2',
                    type: 'ESSAY',
                    section_id: 'sec-part-2',
                    content: { prompt: 'Part 2 Essay', maxLength: 1000 },
                },
                {
                    id: 'q-sec-3',
                    type: 'TRUE_FALSE',
                    content: { prompt: 'Unsectioned Question' },
                },
            ],
        };

        const adapted = adaptExamQuestionsForMobile(examData);
        expect(adapted).toHaveLength(3);

        expect(adapted[0].sectionId).toBe('sec-part-1');
        expect(adapted[0].content).toEqual({ prompt: 'Part 1 Question', options: ['A', 'B'] });
        expect(adapted[0].originalContent).toEqual({ prompt: 'Part 1 Question', options: ['A', 'B'] });

        expect(adapted[1].sectionId).toBe('sec-part-2');
        expect(adapted[1].content).toEqual({ prompt: 'Part 2 Essay', maxLength: 1000 });

        expect(adapted[2].sectionId).toBeNull();
        expect(adapted[2].content).toEqual({ prompt: 'Unsectioned Question' });
    });
});
