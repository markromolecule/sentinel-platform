import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';
import { HTTPException } from 'hono/http-exception';

export const EXAM_ROOM_SCHEDULE_CONFLICT_MESSAGE =
    'Selected room is unavailable for the chosen schedule because another exam is already assigned to it.';

function parseDateTime(value: string | Date | null | undefined) {
    if (value === null || value === undefined) {
        return null;
    }

    const parsed = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(parsed.getTime())) {
        return null;
    }

    return parsed;
}

export function buildExamRoomConflictQuery(args: {
    dbClient: DbClient;
    institutionId: string;
    roomId: string;
    startDateTime: Date;
    endDateTime: Date;
    excludeExamId?: string;
}) {
    const { dbClient, institutionId, roomId, startDateTime, endDateTime, excludeExamId } = args;

    let query = dbClient
        .selectFrom('exams as e')
        .select(['e.exam_id'])
        .where('e.room_id', '=', roomId)
        .where('e.institution_id', '=', institutionId)
        .where('e.scheduled_date', 'is not', null)
        .where(
            sql<boolean>`coalesce(
                e.end_date_time,
                e.scheduled_date + (coalesce(e.duration_minutes, 0) * interval '1 minute')
            ) > ${startDateTime}`,
        )
        .where(sql<boolean>`e.scheduled_date < ${endDateTime}`);

    if (excludeExamId) {
        query = query.where('e.exam_id', '!=', excludeExamId);
    }

    return query.orderBy('e.scheduled_date', 'asc');
}

export async function assertExamRoomAvailability(args: {
    dbClient: DbClient;
    institutionId?: string | null;
    roomId?: string | null;
    startDateTime?: string | Date | null;
    endDateTime?: string | Date | null;
    excludeExamId?: string;
}) {
    const { dbClient, institutionId, roomId, excludeExamId } = args;

    if (!roomId) {
        return;
    }

    const startDateTime = parseDateTime(args.startDateTime);
    const endDateTime = parseDateTime(args.endDateTime);

    if (!institutionId) {
        throw new HTTPException(400, {
            message: 'Room reservation checks require an institution-scoped exam.',
        });
    }

    if (!startDateTime || !endDateTime) {
        throw new HTTPException(400, {
            message: 'Room reservation checks require a valid exam schedule.',
        });
    }

    const conflictingExam = await buildExamRoomConflictQuery({
        dbClient,
        institutionId,
        roomId,
        startDateTime,
        endDateTime,
        excludeExamId,
    }).executeTakeFirst();

    if (conflictingExam) {
        throw new HTTPException(409, {
            message: EXAM_ROOM_SCHEDULE_CONFLICT_MESSAGE,
        });
    }
}
