import { type DbClient } from '@sentinel/db';
import type { UpdateExamBody } from '../exam.dto';
import { LogsService } from '../../../general/logs/logs.service';

interface LogExamUpdateArgs {
    dbClient: DbClient;
    userId: string;
    examId: string;
    institutionId: string;
    currentTitle: string;
    currentStatus: string | null;
    body: UpdateExamBody;
}

/**
 * Records an audit log event for the exam update action.
 * Any errors encountered during logging are caught and warned, rather than crashing the request.
 * Note: In a production environment with strict compliance requirements, these failures should be
 * routed to a centralized monitoring/alerting system or stored in a dead-letter/retry queue.
 */
export async function logExamUpdate({
    dbClient,
    userId,
    examId,
    institutionId,
    currentTitle,
    currentStatus,
    body,
}: LogExamUpdateArgs): Promise<void> {
    try {
        await LogsService.createLog(dbClient, {
            userId,
            action: 'exam.update',
            resourceType: 'exam',
            resourceId: examId,
            activeInstitutionId: institutionId,
            details: {
                title: body.title || currentTitle,
                status: body.status || currentStatus,
            },
        });
    } catch (logErr) {
        console.warn(
            `Failed to log exam.update event for exam ${examId} (user: ${userId}, institution: ${institutionId}):`,
            logErr,
        );
    }
}
