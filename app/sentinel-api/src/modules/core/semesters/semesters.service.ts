import { type DbClient } from '@sentinel/db';
import { type CreateSemesterBody, type UpdateSemesterBody } from './semesters.dto';
import { getSemestersService } from './services/get-semesters.service';
import { createSemesterService } from './services/create-semester.service';
import { updateSemesterService } from './services/update-semester.service';
import { deleteSemesterService } from './services/delete-semester.service';
import { deleteSemestersService } from './services/delete-semesters.service';

export class SemesterService {
    /**
     * @deprecated Use getSemestersService directly
     */
    static async getSemesters(
        dbClient: DbClient,
        institutionId?: string,
        search?: string,
        page?: number,
        limit?: number,
    ) {
        return getSemestersService({ dbClient, institutionId, search, page, limit });
    }

    /**
     * @deprecated Use createSemesterService directly
     */
    static async createSemester(
        dbClient: DbClient,
        data: CreateSemesterBody,
        institutionId?: string,
        actorUserId?: string,
    ) {
        return createSemesterService({ dbClient, data, institutionId, actorUserId });
    }

    /**
     * @deprecated Use updateSemesterService directly
     */
    static async updateSemester(
        dbClient: DbClient,
        id: string,
        data: UpdateSemesterBody,
        institutionId?: string,
        actorUserId?: string,
    ) {
        return updateSemesterService({ dbClient, id, data, institutionId, actorUserId });
    }

    /**
     * @deprecated Use deleteSemesterService directly
     */
    static async deleteSemester(
        dbClient: DbClient,
        id: string,
        institutionId?: string,
        actorUserId?: string,
    ) {
        return deleteSemesterService({ dbClient, id, institutionId, actorUserId });
    }

    /**
     * @deprecated Use deleteSemestersService directly
     */
    static async deleteSemesters(
        dbClient: DbClient,
        ids: string[],
        institutionId?: string,
        actorUserId?: string,
    ) {
        return deleteSemestersService({ dbClient, ids, institutionId, actorUserId });
    }
}
