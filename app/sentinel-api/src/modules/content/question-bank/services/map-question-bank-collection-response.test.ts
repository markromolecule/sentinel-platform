import { describe, expect, it } from 'vitest';
import { mapQuestionBankCollectionResponse } from './map-question-bank-collection-response';

describe('mapQuestionBankCollectionResponse', () => {
    it('preserves creator and updater ids for ownership checks', () => {
        const result = mapQuestionBankCollectionResponse({
            record: {
                collection_id: 'collection-1',
                institution_id: 'inst-1',
                name: 'Biology Set',
                description: 'Sample collection',
                tags: [],
                is_public: false,
                created_at: new Date('2026-06-15T00:00:00Z'),
                updated_at: new Date('2026-06-15T00:00:00Z'),
                created_by: 'creator-1',
                updated_by: 'updater-1',
                creator_first_name: 'Creator',
                creator_last_name: 'One',
                updater_first_name: 'Updater',
                updater_last_name: 'Two',
                question_count: 3,
            },
        });

        expect(result.createdById).toBe('creator-1');
        expect(result.updatedById).toBe('updater-1');
    });
});
