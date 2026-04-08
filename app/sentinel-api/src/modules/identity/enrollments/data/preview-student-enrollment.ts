import { type DbClient } from '@sentinel/db';

export async function previewStudentEnrollmentData({
    dbClient,
    institutionId,
    studentNumbers,
    classGroupId,
}: {
    dbClient: DbClient;
    institutionId: string;
    studentNumbers: string[];
    classGroupId?: string;
}) {
    if (!studentNumbers.length) {
        return [];
    }

    const whitelistRecords = await dbClient
        .selectFrom('student_whitelist')
        .select(['student_number', 'claimed_user_id'])
        .where('institution_id', '=', institutionId)
        .where('student_number', 'in', studentNumbers)
        .execute();

    const whitelistMap = new Map(
        whitelistRecords.map((record) => [record.student_number, record]),
    );
    const claimedUserIds = whitelistRecords
        .map((record) => record.claimed_user_id)
        .filter((claimedUserId): claimedUserId is string => Boolean(claimedUserId));
    const alreadyEnrolledUserIds = new Set<string>();

    if (classGroupId && claimedUserIds.length > 0) {
        const existingEnrollments = await dbClient
            .selectFrom('enrollments as e')
            .innerJoin('students as s', 's.student_id', 'e.student_id')
            .select('s.user_id')
            .where('e.class_group_id', '=', classGroupId)
            .where('s.user_id', 'in', claimedUserIds)
            .execute();

        existingEnrollments.forEach((record) => {
            if (record.user_id) {
                alreadyEnrolledUserIds.add(record.user_id);
            }
        });
    }

    return studentNumbers.map((studentNumber) => {
        const record = whitelistMap.get(studentNumber);

        if (!record) {
            return {
                studentNumber,
                claimStatus: 'NOT_WHITELISTED' as const,
                reason: 'Student not found in whitelist.',
            };
        }

        if (!record.claimed_user_id) {
            return {
                studentNumber,
                claimStatus: 'UNCLAIMED' as const,
                reason: 'Account not yet claimed.',
            };
        }

        if (classGroupId && alreadyEnrolledUserIds.has(record.claimed_user_id)) {
            return {
                studentNumber,
                claimStatus: 'ALREADY_ENROLLED' as const,
                reason: 'Student is already enrolled in the selected section.',
            };
        }

        return {
            studentNumber,
            claimStatus: 'CLAIMED' as const,
            reason: null,
        };
    });
}
