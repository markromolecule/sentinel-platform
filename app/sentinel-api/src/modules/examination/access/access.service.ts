import { type DbClient } from '@sentinel/db';
import type { ExamAccessEligibility } from './access.dto';
import { AccessGatekeeperService } from './services/access-gatekeeper.service';

export class AccessService {
    static async verifyExamEligibility(
        dbClient: DbClient,
        userId: string,
        examId: string,
        now?: Date,
    ): Promise<ExamAccessEligibility> {
        return await AccessGatekeeperService.verifyStudentExamEligibility(
            dbClient,
            userId,
            examId,
            now,
        );
    }
}

export { AccessGatekeeperService } from './services/access-gatekeeper.service';
