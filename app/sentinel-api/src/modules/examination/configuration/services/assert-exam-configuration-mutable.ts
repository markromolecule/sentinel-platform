import { HTTPException } from 'hono/http-exception';
import { normalizeExamStatus } from '@sentinel/shared';

export function assertExamConfigurationMutable(exam: {
    status?: string | null;
    published_at?: Date | string | null;
}) {
    if (exam.published_at || normalizeExamStatus(exam.status) === 'published') {
        throw new HTTPException(409, {
            message: 'Exam settings and configuration are locked once the exam is published.',
        });
    }
}
