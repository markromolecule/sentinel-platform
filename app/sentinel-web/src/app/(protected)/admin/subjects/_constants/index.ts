export {
    MOCK_SUBJECTS,
    MOCK_MASTER_SUBJECTS
} from "@sentinel/shared/src/mock-data";

// Re-export default state using shared mocks if needed, 
// but useSubjectStore now constructs it locally. 
// We can remove DEFAULT_SUBJECT_STORE_STATE export if we confirm it's unused, 
// or reconstruct it here for backward compatibility.

import { SubjectStoreState } from "@/app/(protected)/admin/subjects/_types";
import { MOCK_SUBJECTS, MOCK_MASTER_SUBJECTS } from "@sentinel/shared/src/mock-data";

export const DEFAULT_SUBJECT_STORE_STATE: SubjectStoreState = {
    subjects: MOCK_SUBJECTS,
    masterSubjects: MOCK_MASTER_SUBJECTS,
};