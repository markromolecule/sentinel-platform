import { type ApiIncidentLogItem } from '@sentinel/services';

interface GroupedStudent {
    studentId: string;
    studentName: string;
    studentNo: string;
    sectionName: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    status: ApiIncidentLogItem['status'];
    elapsedSeconds: number;
    timestamp: string;
    platform: 'WEB' | 'MOBILE' | null;
    source: 'CLIENT' | 'SERVER' | 'AI' | null;
    incidentCount: number;
    incidents: ApiIncidentLogItem[];
    baseline: ApiIncidentLogItem;
}

/**
 * Combines raw incidents list by grouping them by studentName or studentId.
 * Prioritizes high severity values, pending statuses, and latest timestamps.
 */
export function groupIncidentsByStudent(incidents: ApiIncidentLogItem[]): ApiIncidentLogItem[] {
    const studentMap = new Map<string, GroupedStudent>();

    incidents.forEach((item) => {
        const key = item.studentId || item.studentName || 'unknown';
        const existing = studentMap.get(key);
        if (!existing) {
            studentMap.set(key, {
                studentId: item.studentId || '',
                studentName: item.studentName || 'Unknown Student',
                studentNo: item.studentNo || 'No ID',
                sectionName: item.sectionName || 'Unassigned',
                severity: item.severity || 'LOW',
                status: item.status || 'PENDING',
                elapsedSeconds: item.elapsedSeconds,
                timestamp: item.timestamp || '',
                platform: item.platform,
                source: item.source,
                incidentCount: 1,
                incidents: [item],
                baseline: item,
            });
        } else {
            existing.incidentCount += 1;
            existing.incidents.push(item);

            // Severity priority: HIGH > MEDIUM > LOW
            const severityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
            const currentVal = severityOrder[existing.severity] || 0;
            const itemVal = severityOrder[item.severity || 'LOW'] || 0;
            if (itemVal > currentVal) {
                existing.severity = item.severity || 'LOW';
            }

            // Status priority: PENDING > CONFIRMED > DISMISSED
            if (existing.status !== 'PENDING') {
                if (item.status === 'PENDING') {
                    existing.status = 'PENDING';
                } else if (existing.status !== 'CONFIRMED' && item.status === 'CONFIRMED') {
                    existing.status = 'CONFIRMED';
                }
            }

            // Latest timestamp
            if (
                item.timestamp &&
                (!existing.timestamp || new Date(item.timestamp) > new Date(existing.timestamp))
            ) {
                existing.timestamp = item.timestamp;
                existing.elapsedSeconds = item.elapsedSeconds;
            }
        }
    });

    return Array.from(studentMap.values()).map((s) => ({
        ...s.baseline,
        severity: s.severity,
        status: s.status,
        elapsedSeconds: s.elapsedSeconds,
        timestamp: s.timestamp,
        details: {
            ...s.baseline.details,
            _incidents: s.incidents,
            _isGrouped: true,
            _incidentCount: s.incidentCount,
        },
    }));
}
