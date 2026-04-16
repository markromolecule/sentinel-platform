export { MOCK_SUBJECTS, MOCK_MASTER_SUBJECTS } from '../../../mock-data';

// Re-export default state using shared mocks if needed,
// but useSubjectStore now constructs it locally.
// We can remove DEFAULT_SUBJECT_STORE_STATE export if we confirm it's unused,
// or reconstruct it here for backward compatibility.

import { SubjectStoreState } from '../../../types/admin/subjects';
import { MOCK_SUBJECTS, MOCK_MASTER_SUBJECTS } from '../../../mock-data';

export const SUBJECT_QUERY_KEYS = {
    all: ['subjects'] as const,
    enrolled: ['subjects', 'enrolled'] as const,
    requests: ['subjects', 'requests'] as const,
    details: (id: string) => ['subjects', id] as const,
};

export const SUBJECT_CLASSIFICATION_QUERY_KEYS = {
    all: ['subject-classifications'] as const,
    details: (id: string) => ['subject-classifications', id] as const,
};

export const SUBJECT_OFFERING_QUERY_KEYS = {
    all: ['subject-offerings'] as const,
    details: (id: string) => ['subject-offerings', id] as const,
};

export const DEFAULT_SUBJECT_STORE_STATE: SubjectStoreState = {
    subjects: MOCK_SUBJECTS,
    masterSubjects: MOCK_MASTER_SUBJECTS,
};
