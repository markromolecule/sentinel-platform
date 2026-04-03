import { HTTPException } from 'hono/http-exception';

export function requireExamRecord<T>(exam: T | undefined): T {
    if (!exam) {
        throw new HTTPException(404, {
            message: 'Exam not found.',
        });
    }

    return exam;
}
