import { type DbClient } from '@sentinel/db';
import {
    getExamArchiveCutoff,
    Schema,
    type ExamRuntimeAccessType,
    type UpdateExamRuntimeAccessBodyType,
} from '@sentinel/shared';

const EXAM_RUNTIME_ACCESS_SETTING_KEY_PREFIX = 'examination.exam-runtime-access.';

type PersistedExamRuntimeAccess = {
    state: 'locked' | 'reopened' | 'closed';
    reopenedUntil: string | null;
};

type ResolveExamRuntimeAccessArgs = {
    scheduledDate?: Date | string | null;
    endDateTime?: Date | string | null;
    durationMinutes?: number | null;
    persistedAccess?: PersistedExamRuntimeAccess | null;
    now?: Date;
    hasActiveAttempt?: boolean;
};

function getExamRuntimeAccessSettingKey(examId: string) {
    return `${EXAM_RUNTIME_ACCESS_SETTING_KEY_PREFIX}${examId}`;
}

function parseDateValue(value?: Date | string | null) {
    if (!value) {
        return null;
    }

    const parsed = value instanceof Date ? value : new Date(value);

    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toIsoDate(value?: Date | string | null) {
    const parsed = parseDateValue(value);

    return parsed ? parsed.toISOString() : null;
}

function buildRuntimeAccess(args: {
    state: ExamRuntimeAccessType['state'];
    reasonCode: ExamRuntimeAccessType['reasonCode'];
    message: string;
    canStart: boolean;
    canResume: boolean;
    hasActiveAttempt: boolean;
    startsAt?: Date | string | null;
    endsAt?: Date | string | null;
    reopenedUntil?: Date | string | null;
}): ExamRuntimeAccessType {
    return {
        state: args.state,
        reasonCode: args.reasonCode,
        message: args.message,
        canStart: args.canStart,
        canResume: args.canResume,
        hasActiveAttempt: args.hasActiveAttempt,
        startsAt: toIsoDate(args.startsAt),
        endsAt: toIsoDate(args.endsAt),
        reopenedUntil: toIsoDate(args.reopenedUntil),
    };
}

export function resolveExamRuntimeAccess(
    args: ResolveExamRuntimeAccessArgs,
): ExamRuntimeAccessType {
    const now = args.now ?? new Date();
    const hasActiveAttempt = Boolean(args.hasActiveAttempt);
    const startsAt = parseDateValue(args.scheduledDate);
    const endsAt = getExamArchiveCutoff({
        scheduledDate: args.scheduledDate,
        endDateTime: args.endDateTime,
        durationMinutes: args.durationMinutes ?? undefined,
        now,
    });
    const reopenedUntil = parseDateValue(args.persistedAccess?.reopenedUntil);

    if (args.persistedAccess?.state === 'closed') {
        return buildRuntimeAccess({
            state: 'closed',
            reasonCode: 'CLOSED',
            message: 'This exam has been closed by the instructor.',
            canStart: false,
            canResume: false,
            hasActiveAttempt,
            startsAt,
            endsAt,
        });
    }

    if (
        args.persistedAccess?.state === 'reopened' &&
        reopenedUntil &&
        reopenedUntil.getTime() > now.getTime()
    ) {
        return buildRuntimeAccess({
            state: 'reopened',
            reasonCode: 'REOPENED',
            message: `This exam was reopened until ${reopenedUntil.toLocaleString()}.`,
            canStart: true,
            canResume: true,
            hasActiveAttempt,
            startsAt,
            endsAt,
            reopenedUntil,
        });
    }

    if (args.persistedAccess?.state === 'locked') {
        return buildRuntimeAccess({
            state: 'locked',
            reasonCode: 'LOCKED',
            message: hasActiveAttempt
                ? 'This exam is locked to new joins, but your active attempt can still resume.'
                : 'This exam is locked by the instructor.',
            canStart: false,
            canResume: hasActiveAttempt,
            hasActiveAttempt,
            startsAt,
            endsAt,
        });
    }

    if (startsAt && startsAt.getTime() > now.getTime()) {
        return buildRuntimeAccess({
            state: 'before_start',
            reasonCode: 'NOT_STARTED',
            message: `This exam will open on ${startsAt.toLocaleString()}.`,
            canStart: false,
            canResume: false,
            hasActiveAttempt,
            startsAt,
            endsAt,
        });
    }

    if (endsAt && endsAt.getTime() <= now.getTime()) {
        return buildRuntimeAccess({
            state: 'closed',
            reasonCode: 'CLOSED',
            message: hasActiveAttempt
                ? 'The scheduled exam window has closed, but your active attempt can still resume.'
                : 'This exam window has already closed.',
            canStart: false,
            canResume: hasActiveAttempt,
            hasActiveAttempt,
            startsAt,
            endsAt,
        });
    }

    return buildRuntimeAccess({
        state: 'open',
        reasonCode: 'OPEN',
        message: 'This exam is open for students.',
        canStart: true,
        canResume: hasActiveAttempt,
        hasActiveAttempt,
        startsAt,
        endsAt,
    });
}

export class RuntimeAccessService {
    static async getPersistedExamRuntimeAccess(dbClient: DbClient, examId: string) {
        const record = await dbClient
            .selectFrom('system_settings')
            .select('setting_value')
            .where('setting_key', '=', getExamRuntimeAccessSettingKey(examId))
            .executeTakeFirst();

        if (!record?.setting_value) {
            return null;
        }

        const parsed = Schema.updateExamRuntimeAccessBodyBaseSchema
            .pick({ state: true, reopenedUntil: true })
            .transform((value) => ({
                state:
                    value.state === 'locked' ||
                    value.state === 'reopened' ||
                    value.state === 'closed'
                        ? value.state
                        : null,
                reopenedUntil:
                    typeof value.reopenedUntil === 'string'
                        ? value.reopenedUntil
                        : value.reopenedUntil instanceof Date
                          ? value.reopenedUntil.toISOString()
                          : null,
            }))
            .safeParse(record.setting_value);

        if (!parsed.success || !parsed.data.state) {
            return null;
        }

        return parsed.data as PersistedExamRuntimeAccess;
    }

    static async resolveExamRuntimeAccess(args: {
        dbClient: DbClient;
        examId: string;
        scheduledDate?: Date | string | null;
        endDateTime?: Date | string | null;
        durationMinutes?: number | null;
        now?: Date;
        hasActiveAttempt?: boolean;
    }) {
        const persistedAccess = await RuntimeAccessService.getPersistedExamRuntimeAccess(
            args.dbClient,
            args.examId,
        );

        return resolveExamRuntimeAccess({
            scheduledDate: args.scheduledDate,
            endDateTime: args.endDateTime,
            durationMinutes: args.durationMinutes,
            now: args.now,
            hasActiveAttempt: args.hasActiveAttempt,
            persistedAccess,
        });
    }

    static async updateExamRuntimeAccess(args: {
        dbClient: DbClient;
        examId: string;
        body: UpdateExamRuntimeAccessBodyType;
        updatedBy?: string | null;
        scheduledDate?: Date | string | null;
        endDateTime?: Date | string | null;
        durationMinutes?: number | null;
    }) {
        const { dbClient, examId, body, updatedBy } = args;

        if (body.state === 'open') {
            await dbClient
                .deleteFrom('system_settings')
                .where('setting_key', '=', getExamRuntimeAccessSettingKey(examId))
                .execute();

            return resolveExamRuntimeAccess({
                scheduledDate: args.scheduledDate,
                endDateTime: args.endDateTime,
                durationMinutes: args.durationMinutes,
            });
        }

        const payload = {
            state: body.state,
            reopenedUntil:
                body.state === 'reopened' && body.reopenedUntil
                    ? new Date(body.reopenedUntil).toISOString()
                    : null,
        };

        await dbClient
            .insertInto('system_settings')
            .values({
                category: 'examination',
                setting_key: getExamRuntimeAccessSettingKey(examId),
                setting_value: payload as any,
                description: 'Exam runtime access override for lock, reopen, and close actions.',
                updated_at: new Date(),
                updated_by: updatedBy || null,
            })
            .onConflict((oc) =>
                oc.column('setting_key').doUpdateSet({
                    category: 'examination',
                    setting_value: payload as any,
                    description:
                        'Exam runtime access override for lock, reopen, and close actions.',
                    updated_at: new Date(),
                    updated_by: updatedBy || null,
                }),
            )
            .execute();

        return resolveExamRuntimeAccess({
            scheduledDate: args.scheduledDate,
            endDateTime: args.endDateTime,
            durationMinutes: args.durationMinutes,
            persistedAccess: payload,
        });
    }
}
