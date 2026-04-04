import { describe, expect, it } from 'vitest';
import { validateQuestionContentByType } from '../../modules/assessment/assessment-contracts';
import { mapQuestionResponse } from '../../modules/question/services/map-question-response';

describe('question contracts', () => {
    it('accepts valid multiple choice content', () => {
        const result = validateQuestionContentByType('MULTIPLE_CHOICE', {
            prompt: 'What is the capital of France?',
            options: ['London', 'Berlin', 'Paris', 'Madrid'],
            correctAnswer: 'Paris',
        });

        expect(result).toMatchObject({
            correctAnswer: 'Paris',
        });
    });

    it('rejects multiple choice content when the answer is not in the options', () => {
        expect(() =>
            validateQuestionContentByType('MULTIPLE_CHOICE', {
                prompt: 'What is the capital of France?',
                options: ['London', 'Berlin', 'Madrid'],
                correctAnswer: 'Paris',
            }),
        ).toThrow();
    });

    it('maps question response names using profile data before falling back to ids', () => {
        const result = mapQuestionResponse({
            question_bank_question_id: '8f29ca39-fcad-4736-a41e-0f24ff4ea06f',
            subject_id: '0f70594a-d154-4892-9dd2-3cae42e26dda',
            institution_id: '33560732-ef36-4670-b20c-a718f31179a0',
            question_type: 'MULTIPLE_CHOICE',
            difficulty: 'MODERATE',
            points: 2,
            tags: ['geography'],
            content: {
                prompt: 'What is the capital of France?',
                options: ['London', 'Berlin', 'Paris', 'Madrid'],
                correctAnswer: 'Paris',
            },
            prompt: 'What is the capital of France?',
            created_at: '2026-04-03T12:00:00.000Z',
            updated_at: '2026-04-03T12:30:00.000Z',
            created_by: 'creator-user-id',
            updated_by: 'updater-user-id',
            creator_first_name: 'Ada',
            creator_last_name: 'Lovelace',
            updater_first_name: null,
            updater_last_name: null,
        });

        expect(result.createdBy).toBe('Ada Lovelace');
        expect(result.updatedBy).toBe('updater-user-id');
        expect(result.difficulty).toBe('MODERATE');
    });
});
