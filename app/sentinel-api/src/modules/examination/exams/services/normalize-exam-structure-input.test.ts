import { describe, expect, it } from 'vitest';
import { normalizeExamStructureInput } from './normalize-exam-structure-input.service';

describe('normalizeExamStructureInput', () => {
    it('trims section descriptions and stores blank descriptions as null', () => {
        const result = normalizeExamStructureInput({
            examId: '11111111-1111-4111-8111-111111111111',
            questionSections: [
                {
                    id: '22222222-2222-4222-8222-222222222222',
                    title: 'Part I',
                    description: '  Read the scenario before answering.  ',
                    orderIndex: 0,
                },
                {
                    id: '33333333-3333-4333-8333-333333333333',
                    title: 'Part II',
                    description: '   ',
                    orderIndex: 1,
                },
            ],
            questions: [],
        });

        expect(result.normalizedSections).toMatchObject([
            {
                exam_section_id: '22222222-2222-4222-8222-222222222222',
                description: 'Read the scenario before answering.',
            },
            {
                exam_section_id: '33333333-3333-4333-8333-333333333333',
                description: null,
            },
        ]);
    });
});
