import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as os from 'node:os';

export const AI_JOB_STAGING_BASE_DIR = path.join(os.tmpdir(), 'ai-jobs');
export const DEFAULT_STALE_SWEEP_THRESHOLD_MS = 60 * 60 * 1000; // 1 hour

export class AiJobFileStagingService {
    static getJobDirectory(jobId: string): string {
        return path.join(AI_JOB_STAGING_BASE_DIR, jobId);
    }

    /**
     * Writes uploaded files to ephemeral disk storage under /tmp/ai-jobs/<jobId>/.
     */
    static async stageUploadedFiles(jobId: string, files: File[]): Promise<string[]> {
        const jobDir = this.getJobDirectory(jobId);
        await fs.mkdir(jobDir, { recursive: true });

        const filePaths: string[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const safeName = `${i}_${path.basename(file.name)}`;
            const destPath = path.join(jobDir, safeName);
            const buffer = Buffer.from(await file.arrayBuffer());
            await fs.writeFile(destPath, buffer);
            filePaths.push(destPath);
        }

        return filePaths;
    }

    /**
     * Reads staged files from disk and reconstructs standard File instances.
     */
    static async loadStagedFiles(jobId: string): Promise<File[]> {
        const jobDir = this.getJobDirectory(jobId);

        try {
            const entries = await fs.readdir(jobDir);
            const files: File[] = [];

            for (const entry of entries) {
                const filePath = path.join(jobDir, entry);
                const stat = await fs.stat(filePath);
                if (stat.isFile()) {
                    const buffer = await fs.readFile(filePath);
                    const originalName = entry.replace(/^\d+_/, '');
                    const file = new File([buffer], originalName, { type: 'application/pdf' });
                    files.push(file);
                }
            }

            return files;
        } catch (error: any) {
            if (error.code === 'ENOENT') {
                return [];
            }
            throw error;
        }
    }

    /**
     * Completely unlinks the staged files and folder for a specific job.
     */
    static async cleanupJobFiles(jobId: string): Promise<void> {
        const jobDir = this.getJobDirectory(jobId);
        try {
            await fs.rm(jobDir, { recursive: true, force: true });
        } catch (error: any) {
            console.error(`[AiJobFileStaging] Error unlinking directory for job ${jobId}:`, error);
        }
    }

    /**
     * Sweeps /tmp/ai-jobs/ and unlinks any orphaned directories older than threshold.
     * Prevents temporary disk exhaustion in case worker containers crash unexpectedly.
     */
    static async sweepStaleJobFiles(
        olderThanMs: number = DEFAULT_STALE_SWEEP_THRESHOLD_MS,
    ): Promise<number> {
        try {
            await fs.mkdir(AI_JOB_STAGING_BASE_DIR, { recursive: true });
            const entries = await fs.readdir(AI_JOB_STAGING_BASE_DIR);
            const now = Date.now();
            let sweptCount = 0;

            for (const entry of entries) {
                const entryPath = path.join(AI_JOB_STAGING_BASE_DIR, entry);
                try {
                    const stat = await fs.stat(entryPath);
                    if (stat.isDirectory()) {
                        const age = now - stat.mtimeMs;
                        if (age > olderThanMs) {
                            await fs.rm(entryPath, { recursive: true, force: true });
                            sweptCount++;
                            console.log(
                                `[AiJobFileStaging] Purged orphaned directory: ${entry} (age: ${Math.round(age / 1000)}s)`,
                            );
                        }
                    }
                } catch {
                    // Ignore transient errors on individual entries
                }
            }

            return sweptCount;
        } catch (error: any) {
            console.error('[AiJobFileStaging] Failed to sweep stale staging directories:', error);
            return 0;
        }
    }
}
