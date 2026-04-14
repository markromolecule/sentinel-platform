import { type DbClient } from '@sentinel/db';
import { type TelemetryIncidentRecord, type GetTelemetryIncidentsQuery } from '../storage.dto';
import { getIncidentsFromDb, getIncidentByIdFromDb } from '../data/get-incidents';

export class IncidentQueryService {
    /**
     * Retrieves a list of incidents from the database.
     */
    static async getIncidents(
        db: DbClient,
        filters: GetTelemetryIncidentsQuery,
        scopedInstitutionId?: string,
    ): Promise<TelemetryIncidentRecord[]> {
        return getIncidentsFromDb(db, filters, scopedInstitutionId);
    }

    /**
     * Retrieves a single incident by its ID.
     */
    static async getIncidentById(
        db: DbClient,
        incidentId: string,
        scopedInstitutionId?: string,
    ): Promise<TelemetryIncidentRecord> {
        return getIncidentByIdFromDb(db, incidentId, scopedInstitutionId);
    }
}
