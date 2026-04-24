import { describe, expect, it } from 'vitest';
import { createSubjectOfferingsFromClassificationRoute } from './controllers/create-subject-offerings-from-classification.controller';
import { createSubjectOfferingsFromClassificationSchema } from './subject-offerings.dto';

describe('bulk classification subject offering contract', () => {
    it('validates the request body and defaults duplicate strategy to skip_existing', () => {
        const parsed = createSubjectOfferingsFromClassificationSchema.body.parse({
            subject_classification_id: '11111111-1111-4111-8111-111111111111',
            term_id: '22222222-2222-4222-8222-222222222222',
            department_ids: ['33333333-3333-4333-8333-333333333333'],
            course_ids: ['44444444-4444-4444-8444-444444444444'],
            section_ids: ['55555555-5555-4555-8555-555555555555'],
            year_levels: [1, 2],
        });

        expect(parsed.duplicate_strategy).toBe('skip_existing');
    });

    it('validates the response summary shape', () => {
        const parsed = createSubjectOfferingsFromClassificationSchema.response.parse({
            message: 'Subject offerings created from classification successfully',
            data: {
                classification_id: '11111111-1111-4111-8111-111111111111',
                classification_name: 'General Education',
                term_id: '22222222-2222-4222-8222-222222222222',
                created_count: 0,
                skipped_count: 1,
                total_subject_count: 1,
                duplicate_strategy: 'skip_existing',
                created: [],
                skipped: [
                    {
                        subject_id: '66666666-6666-4666-8666-666666666666',
                        subject_code: 'GE101',
                        subject_title: 'Understanding the Self',
                        existing_subject_offering_id: '77777777-7777-4777-8777-777777777777',
                        reason: 'already_offered',
                    },
                ],
            },
        });

        expect(parsed.data.skipped_count).toBe(1);
    });

    it('documents a forbidden response for missing offer permissions', () => {
        expect(createSubjectOfferingsFromClassificationRoute.responses).toHaveProperty('403');
    });
});
