import { type DbClient } from '@sentinel/db';
import type { PersistableProctoringEvent } from '../ingestion/ingestion.dto';
import {
    type GetTelemetryIncidentsQuery,
    type TelemetryIncidentRecord,
    type UpdateTelemetryIncidentBody,
} from './storage.dto';
import { IncidentPersistenceService } from './services/incident-persistence.service';
import { IncidentQueryService } from './services/incident-query.service';
import { IncidentReviewService } from './services/incident-review.service';

/**
 * TelemetryStorageService acts as a facade for incident-related operations,
 * delegating to specialized services for persistence, querying, and reviews.
 */
export class TelemetryStorageService {
    /**
     * Appends a single proctoring event into the incident log.
     */
    static async appendEvent(db: DbClient, payload: PersistableProctoringEvent): Promise<void> {
        return IncidentPersistenceService.appendEvent(db, payload);
    }

    /**
     * Appends a batch of proctoring events into the incident log.
     */
    static async appendBatch(db: DbClient, events: PersistableProctoringEvent[]): Promise<void> {
        return IncidentPersistenceService.appendBatch(db, events);
    }

    /**
     * Retrieves a list of incidents based on filters.
     */
    static async getIncidents(
        db: DbClient,
        filters: GetTelemetryIncidentsQuery,
        scopedInstitutionId?: string,
    ): Promise<TelemetryIncidentRecord[]> {
        return IncidentQueryService.getIncidents(db, filters, scopedInstitutionId);
    }

    /**
     * Retrieves a single incident by ID.
     */
    static async getIncidentById(
        db: DbClient,
        incidentId: string,
        scopedInstitutionId?: string,
    ): Promise<TelemetryIncidentRecord> {
        return IncidentQueryService.getIncidentById(db, incidentId, scopedInstitutionId);
    }

    /**
     * Updates an incident's review status and notes.
     */
    static async updateIncidentReview(
        db: DbClient,
        incidentId: string,
        updates: UpdateTelemetryIncidentBody,
        reviewerUserId: string,
        scopedInstitutionId?: string,
    ): Promise<TelemetryIncidentRecord> {
        return IncidentReviewService.updateIncidentReview(
            db,
            incidentId,
            updates,
            reviewerUserId,
            scopedInstitutionId,
        );
    }
}
