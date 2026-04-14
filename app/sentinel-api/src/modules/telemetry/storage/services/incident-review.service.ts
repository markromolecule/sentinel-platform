import { type DbClient } from '@sentinel/db';
import { type TelemetryIncidentRecord, type UpdateTelemetryIncidentBody } from '../storage.dto';
import { IncidentQueryService } from './incident-query.service';

export class IncidentReviewService {
    static async updateIncidentReview(
        db: DbClient,
        incidentId: string,
        updates: UpdateTelemetryIncidentBody,
        reviewerUserId: string,
        scopedInstitutionId?: string,
    ): Promise<TelemetryIncidentRecord> {
        // Ensure incident exists and is accessible
        await IncidentQueryService.getIncidentById(db, incidentId, scopedInstitutionId);

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

        return IncidentQueryService.getIncidentById(db, incidentId, scopedInstitutionId);
    }
}
