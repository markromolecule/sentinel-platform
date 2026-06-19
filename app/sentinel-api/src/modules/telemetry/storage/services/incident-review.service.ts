import { type DbClient } from '@sentinel/db';
import { type TelemetryIncidentRecord, type UpdateTelemetryIncidentBody } from '../storage.dto';
import { IncidentQueryService } from './incident-query.service';
import { type UserQueryScope } from '../data/query-scoping';
import { LogsService } from '../../../general/logs/logs.service';
export class IncidentReviewService {
    static async updateIncidentReview(
        db: DbClient,
        incidentId: string,
        updates: UpdateTelemetryIncidentBody,
        reviewerUserId: string,
        scopedInstitutionId?: string,
        userScope?: UserQueryScope,
    ): Promise<TelemetryIncidentRecord> {
        // Ensure incident exists and is accessible
        await IncidentQueryService.getIncidentById(db, incidentId, scopedInstitutionId, userScope);

        const updateValues: {
            status?: string | null;
            evidence_url?: string | null;
            review_notes?: string | null;
            reviewed_by?: string | null;
            reviewed_at?: Date | null;
        } = {};

        if (updates.status !== undefined) {
            updateValues.status = updates.status;
        }

        if (updates.evidenceUrl !== undefined) {
            updateValues.evidence_url = updates.evidenceUrl;
        }

        if (updates.reviewNotes !== undefined) {
            updateValues.review_notes = updates.reviewNotes;
        }

        if (updates.status === 'PENDING') {
            updateValues.reviewed_by = null;
            updateValues.reviewed_at = null;

            if (updates.reviewNotes === undefined) {
                updateValues.review_notes = null;
            }
        } else if (updates.status !== undefined || updates.reviewNotes !== undefined) {
            updateValues.reviewed_by = reviewerUserId;
            updateValues.reviewed_at = new Date();
        }

        await db
            .updateTable('flagged_incidents')
            .set(updateValues)
            .where('incident_id', '=', incidentId)
            .executeTakeFirst();

        const result = await IncidentQueryService.getIncidentById(
            db,
            incidentId,
            scopedInstitutionId,
            userScope,
        );

        // Telemetry logging
        try {
            const instId =
                scopedInstitutionId ||
                (result as any).institutionId ||
                (result as any).institution_id;
            if (instId) {
                await LogsService.createLog(db, {
                    userId: reviewerUserId,
                    action: 'telemetry.incident_reviewed',
                    resourceType: 'telemetry_incident',
                    resourceId: incidentId,
                    activeInstitutionId: instId,
                    details: {
                        incidentId,
                        status: updates.status,
                        reviewerUserId,
                    },
                });
            }
        } catch (logErr) {
            console.error('Failed to log telemetry.incident_reviewed:', logErr);
        }

        return result;
    }
}
