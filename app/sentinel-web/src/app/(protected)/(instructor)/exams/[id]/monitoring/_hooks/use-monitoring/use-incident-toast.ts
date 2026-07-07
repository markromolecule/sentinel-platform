'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import type { StudentSession } from '@sentinel/shared/types';
import type { IncidentSnapshot } from './_types';

/**
 * useIncidentToast monitors student sessions for new or updated proctoring incidents
 * and triggers toast notifications.
 *
 * @param examId - Exam ID being monitored.
 * @param students - List of student sessions from the monitoring query.
 */
export function useIncidentToast(examId: string, students?: StudentSession[]) {
    const incidentSnapshotsRef = useRef<Map<string, IncidentSnapshot>>(new Map());
    const hasHydratedIncidentSnapshotsRef = useRef(false);
    const hydratedExamIdRef = useRef<string | null>(null);

    useEffect(() => {
        if (!students) {
            return;
        }

        const nextSnapshots = new Map<string, IncidentSnapshot>();
        const shouldWarn =
            hasHydratedIncidentSnapshotsRef.current && hydratedExamIdRef.current === examId;

        for (const student of students) {
            const studentKey = student.attemptId;
            const snapshot = {
                incidentCount: student.incidentCount ?? 0,
                openIncidentCount: student.openIncidentCount ?? 0,
                latestIncidentType: student.latestIncidentType ?? null,
            };
            const previous = incidentSnapshotsRef.current.get(studentKey);
            const hasIncreasedCounts =
                shouldWarn &&
                ((previous &&
                    (snapshot.incidentCount > previous.incidentCount ||
                        snapshot.openIncidentCount > previous.openIncidentCount)) ||
                    (!previous && (snapshot.incidentCount > 0 || snapshot.openIncidentCount > 0)));

            if (hasIncreasedCounts) {
                const fullName = `${student.firstName} ${student.lastName}`.trim();
                const incidentLabel = snapshot.latestIncidentType ?? 'proctoring incident';
                const isOccurrenceUpdate =
                    Boolean(previous) &&
                    snapshot.incidentCount > (previous?.incidentCount ?? 0) &&
                    snapshot.openIncidentCount === (previous?.openIncidentCount ?? 0) &&
                    snapshot.latestIncidentType === previous?.latestIncidentType;

                if (isOccurrenceUpdate) {
                    toast.warning('Proctoring incident occurrence updated.', {
                        description: `${fullName} now has ${snapshot.incidentCount} occurrences for ${incidentLabel}.`,
                    });
                } else {
                    toast.warning('New proctoring incident detected.', {
                        description: `${fullName} received ${incidentLabel}.`,
                    });
                }
            }

            nextSnapshots.set(studentKey, snapshot);
        }

        incidentSnapshotsRef.current = nextSnapshots;
        hasHydratedIncidentSnapshotsRef.current = true;
        hydratedExamIdRef.current = examId;
    }, [examId, students]);
}
