import { type DbClient } from '@sentinel/db';
import { getBuilderWorkspaceService } from './services/get-builder-workspace.service';
import { saveBuilderWorkspaceService } from './services/save-builder-workspace.service';
import { publishBuilderWorkspaceService } from './services/publish-builder-workspace.service';
import type { BuilderWorkspace, SaveBuilderWorkspaceBody } from './builder.dto';

/**
 * Service class for exam builder operations.
 * @deprecated Use individual service functions in the services/ directory directly.
 */
export class BuilderService {
    /**
     * Retrieves the builder workspace configuration for a specific exam.
     * @deprecated Use getBuilderWorkspaceService directly.
     */
    static async getBuilderWorkspace(dbClient: DbClient, examId: string, institutionId?: string) {
        return getBuilderWorkspaceService({ dbClient, examId, institutionId });
    }

    /**
     * Saves/updates the current builder workspace state for an exam.
     * @deprecated Use saveBuilderWorkspaceService directly.
     */
    static async saveBuilderWorkspace(
        dbClient: DbClient,
        examId: string,
        body: SaveBuilderWorkspaceBody,
        institutionId: string | undefined,
        userId: string,
        canBypassLock = false,
    ) {
        return saveBuilderWorkspaceService({
            dbClient,
            examId,
            body,
            institutionId,
            userId,
            canBypassLock,
        });
    }

    /**
     * Publishes the builder workspace, transitioning the exam status to published.
     * @deprecated Use publishBuilderWorkspaceService directly.
     */
    static async publishBuilderWorkspace(
        dbClient: DbClient,
        examId: string,
        institutionId: string | undefined,
        userId: string,
    ) {
        return publishBuilderWorkspaceService({
            dbClient,
            examId,
            institutionId,
            userId,
        });
    }
}
