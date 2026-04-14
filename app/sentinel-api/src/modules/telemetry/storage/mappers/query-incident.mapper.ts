import { Schema, type TelemetryIncidentRecord } from '@sentinel/shared';
import { parseIncidentDetails, parseStructuredValue } from './mapper.utils';

/**
 * Maps a raw database row to a structured TelemetryIncidentRecord.
 */
export const mapTelemetryIncidentRow = (row: any): TelemetryIncidentRecord => {
    return {
        incidentId: row.incident_id,
        attemptId: row.attempt_id,
        examId: row.exam_id,
        examTitle: row.exam_title,
        institutionId: row.institution_id,
        studentId: row.student_user_id,
        studentRecordId: row.student_record_id,
        studentName: row.student_name,
        platform: row.platform,
        source: row.source,
        ruleKey: row.rule_key,
        incidentType: row.incident_type,
        severity: row.severity,
        status: row.status,
        timestamp: row.timestamp,
        evidenceUrl: row.evidence_url,
        reviewedBy: row.reviewed_by,
        reviewedAt: row.reviewed_at,
        reviewNotes: row.review_notes,
        configurationSnapshot: parseStructuredValue(
            row.configuration_snapshot,
            Schema.telemetryConfigurationSnapshotSchema,
        ),
        sessionContext: parseStructuredValue(
            row.session_context,
            Schema.telemetrySessionContextSchema,
        ),
        details: parseIncidentDetails(row.details),
    };
};
