import { type DbClient } from '@sentinel/db';
import { getAnalyticsKPIsData } from '../data/get-analytics-kpis';
import { getAnalyticsIncidentSeverityData } from '../data/get-analytics-incident-severity';
import { getAnalyticsIncidentTypeData } from '../data/get-analytics-incident-type';
import { getAnalyticsDepartmentIntegrityData } from '../data/get-analytics-department-integrity';
import { mapAnalyticsKPIs } from './map-analytics-kpis';
import { normalizeAnalyticsOverallData, type AnalyticsOverallData } from '../../pdf-documents/rendering/analytics-overall-view-model';

export interface BuildOverallAnalyticsSnapshotArgs {
    dbClient: DbClient;
    institutionId?: string;
    startAt: Date;
    endAtExclusive: Date;
    timezone?: string;
    periodLabel?: string;
    generatedBy?: string;
}

export class BuildOverallAnalyticsSnapshotService {
    /**
     * Gathers and aggregates all period-scoped analytics data for an institution
     * and compiles it into the normalized executive PDF view model.
     */
    static async buildSnapshot(args: BuildOverallAnalyticsSnapshotArgs): Promise<AnalyticsOverallData> {
        const {
            dbClient,
            institutionId,
            startAt,
            endAtExclusive,
            timezone = 'Asia/Manila',
            periodLabel = 'Custom Period',
            generatedBy = 'Sentinel System'
        } = args;

        // 1. Resolve institution name
        let institutionName = 'Sentinel Platform';
        if (institutionId) {
            const inst = await dbClient
                .selectFrom('institutions')
                .select('name')
                .where('id', '=', institutionId)
                .executeTakeFirst();
            if (inst) {
                institutionName = inst.name;
            }
        }

        // 2. Fetch all raw metrics concurrently using half-open date bounds
        const [rawKPIs, rawSeverity, rawTypes, rawDepts] = await Promise.all([
            getAnalyticsKPIsData(dbClient, { institutionId, startAt, endAtExclusive }),
            getAnalyticsIncidentSeverityData(dbClient, { institutionId, startAt, endAtExclusive }),
            getAnalyticsIncidentTypeData(dbClient, { institutionId, startAt, endAtExclusive }),
            getAnalyticsDepartmentIntegrityData(dbClient, { institutionId, startAt, endAtExclusive })
        ]);

        const mappedKPIs = mapAnalyticsKPIs(rawKPIs);

        // 3. Compile and normalize view model
        return normalizeAnalyticsOverallData({
            generatedAt: new Date().toISOString(),
            generatedBy,
            institutionName,
            periodLabel,
            kpis: {
                averageScore: mappedKPIs.averageScore,
                passRate: mappedKPIs.passRate,
                totalCompletions: mappedKPIs.completedAttempts,
                integrityIncidentsCount: mappedKPIs.totalIncidents,
            },
            departments: rawDepts.map(d => ({
                departmentName: d.department || 'Unknown Department',
                courseCount: d.courseCount || 0,
                studentCount: d.studentCount || 0,
                averageScore: d.averageScore || 0,
                // Derive integrity rate: % of completed attempts that were not flagged
                integrityRate: d.completed > 0
                    ? Math.max(
                        0,
                        Math.min(
                            100,
                            Math.round(((d.completed - d.flagged) / d.completed) * 1000) / 10,
                        ),
                    )
                    : 0
            })),
            incidentTypes: rawTypes.map(t => ({
                type: t.type || 'Other',
                count: t.count || 0,
                percentage: t.percentage || 0
            })),
            incidentSeverities: rawSeverity.map(s => ({
                severity: s.severity,
                count: s.count
            }))
        });
    }
}
