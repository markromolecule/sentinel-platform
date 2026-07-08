import { getExamIncidentsData } from './services/get-incidents.service';
import { reviewExamIncidentsData } from './services/complete-incidents.service';

// Re-exported so callers can also do:
//   import { getExamIncidentsData, reviewExamIncidentsData } from './incident.service';
export { getExamIncidentsData } from './services/get-incidents.service';
export { reviewExamIncidentsData } from './services/complete-incidents.service';

/**
 * Main entry point for exam incident operations.
 *
 * The actual query/command logic now lives in ./services:
 *   - get-incidents.service.ts       -> getExamIncidentsData
 *   - complete-incidents.service.ts  -> reviewExamIncidentsData
 */
export class IncidentsService {
    static getExamIncidentsData = getExamIncidentsData;
    static reviewExamIncidentsData = reviewExamIncidentsData;
}
