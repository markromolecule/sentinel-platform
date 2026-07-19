import { executeTransaction, type DbClient } from '@sentinel/db';
import { UnrecoverableError } from 'bullmq';
import { PdfStorageService } from '../storage/pdf-storage.service';
import { resolvePdfTemplate } from '../services/resolve-pdf-template.service';
import { renderAnalyticsOverallPdf } from '../rendering/analytics-overall-renderer';
import { renderExamAnswerKeyPdf } from '../rendering/exam-answer-key-renderer';
import { BuildOverallAnalyticsSnapshotService } from '../../analytics/services/build-overall-analytics-snapshot.service';
import {
    getAnswerKeySource,
    mapAnswerKeySourceToViewModel,
} from '../data/answer-keys/get-answer-key-source';
import { LogsService } from '../../logs/logs.service';

export class PdfGenerationJobProcessor {
    /**
     * Executes the PDF generation job logic, managing status transitions, template snapshots,
     * rendering, and storage uploads transactionally.
     *
     * @param dbClient database client
     * @param exportId export record UUID
     * @param documentKind type of document being generated
     */
    static async processJob(
        dbClient: DbClient,
        exportId: string,
        documentKind: 'ANALYTICS_OVERALL' | 'EXAM_ANSWER_KEY',
    ): Promise<void> {
        const isAnalytics = documentKind === 'ANALYTICS_OVERALL';
        const tableName = isAnalytics ? 'analytics_reports' : 'exam_answer_key_exports';
        const idCol = isAnalytics ? 'report_id' : 'export_id';

        // 1. Transaction block for claiming the job and updating state
        const taskResult = await executeTransaction(async (trx) => {
            // Select and lock the row to avoid concurrent duplicate processing
            const exportRecord = await trx
                .selectFrom(tableName as any)
                .selectAll()
                .where(idCol as any, '=', exportId)
                .forUpdate()
                .executeTakeFirst();

            if (!exportRecord) {
                return { action: 'SKIP_MISSING' as const, record: null };
            }

            const rec = exportRecord as any;

            // If already complete or generating, skip to preserve idempotency
            if (rec.status === 'READY') {
                return { action: 'SKIP' as const, record: rec };
            }

            // Claim the job: transition PENDING/FAILED to GENERATING, increment retry_count
            const currentRetries = rec.retry_count ?? 0;
            const updateSet: any = {
                status: 'GENERATING',
                retry_count: currentRetries + 1,
                failure_code: null,
                failure_message: null,
            };
            if (!isAnalytics) {
                updateSet.updated_at = new Date();
            }

            const updatedRecord = await trx
                .updateTable(tableName as any)
                .set(updateSet)
                .where(idCol as any, '=', exportId)
                .returningAll()
                .executeTakeFirstOrThrow();

            return { action: 'PROCESS' as const, record: updatedRecord as any };
        });

        if (taskResult.action === 'SKIP') {
            return;
        }
        if (taskResult.action === 'SKIP_MISSING') {
            console.warn(
                `[PDFWorker] Skipping orphaned job for missing ${tableName} record ${exportId}`,
            );
            return;
        }

        const exportRecord = taskResult.record;
        const requestData =
            typeof exportRecord.request_snapshot === 'string'
                ? JSON.parse(exportRecord.request_snapshot)
                : exportRecord.request_snapshot;

        try {
            // 2. Resolve template layout and freeze snapshot
            const resolvedTemplate = await resolvePdfTemplate(
                dbClient,
                exportRecord.institution_id,
                documentKind,
                { persistBuiltInFallback: documentKind === 'EXAM_ANSWER_KEY' },
            );

            const headerConfig = resolvedTemplate.headerConfig;
            const footerConfig = resolvedTemplate.footerConfig;

            // Resolve institution name
            let institutionName = 'Sentinel Platform';
            if (exportRecord.institution_id) {
                const inst = await dbClient
                    .selectFrom('institutions')
                    .select('name')
                    .where('id', '=', exportRecord.institution_id)
                    .executeTakeFirst();
                if (inst) {
                    institutionName = inst.name;
                }
            }

            // 3. Download Branding Logo if applicable
            let logoBuffer: Buffer | null = null;
            if (exportRecord.institution_id) {
                const branding = await dbClient
                    .selectFrom('institution_pdf_branding')
                    .selectAll()
                    .where('institution_id', '=', exportRecord.institution_id)
                    .executeTakeFirst();
                if (branding) {
                    try {
                        logoBuffer = await PdfStorageService.downloadFile(
                            branding.logo_storage_bucket,
                            branding.logo_storage_path,
                        );
                    } catch (e) {
                        // Logo download failure is transient or non-fatal, fallback to null
                        logoBuffer = null;
                    }
                }
            }

            // 4. Gather data and render PDF depending on kind
            let pdfBuffer: Buffer;
            let storagePath: string;

            if (isAnalytics) {
                const instId = exportRecord.institution_id || 'global';
                storagePath = `analytics/${instId}/${exportId}.pdf`;

                const startAt = exportRecord.period_start_at
                    ? new Date(exportRecord.period_start_at)
                    : new Date();
                const endAtExclusive = exportRecord.period_end_at
                    ? new Date(exportRecord.period_end_at)
                    : new Date();
                const timezone = exportRecord.timezone || 'Asia/Manila';

                const analyticsData = await BuildOverallAnalyticsSnapshotService.buildSnapshot({
                    dbClient,
                    institutionId: exportRecord.institution_id || undefined,
                    startAt,
                    endAtExclusive,
                    timezone,
                    periodLabel: requestData?.periodLabel || 'Custom Period',
                    generatedBy: 'Sentinel Analytics System',
                });

                pdfBuffer = await renderAnalyticsOverallPdf(
                    headerConfig,
                    footerConfig,
                    logoBuffer,
                    analyticsData,
                );
            } else {
                // EXAM_ANSWER_KEY — use private loader that enforces institution ownership
                const examId = exportRecord.exam_id;
                if (!examId) {
                    throw new UnrecoverableError(
                        'Invalid request parameters: missing exam_id on export record.',
                    );
                }
                const instId = exportRecord.institution_id || 'global';
                storagePath = `answer-keys/${instId}/${examId}/${exportId}.pdf`;

                const answerKeySource = await getAnswerKeySource(
                    dbClient,
                    examId,
                    exportRecord.institution_id!,
                );
                const answerKeyData = mapAnswerKeySourceToViewModel(
                    answerKeySource,
                    'Sentinel Support',
                );

                pdfBuffer = await renderExamAnswerKeyPdf(
                    headerConfig,
                    footerConfig,
                    logoBuffer,
                    answerKeyData,
                );
            }

            // 5. Upload file to private storage bucket
            const bucket = PdfStorageService.PDF_ARTIFACTS_BUCKET;
            await PdfStorageService.uploadPdf(bucket, storagePath, pdfBuffer);

            // 6. Update status to READY transactionally
            await executeTransaction(async (trx) => {
                const completedAt = new Date();
                const updateSet: any = {
                    status: 'READY',
                    storage_bucket: bucket,
                    storage_path: storagePath,
                    template_id: resolvedTemplate.templateId,
                    template_snapshot: JSON.stringify(resolvedTemplate),
                    completed_at: completedAt,
                };
                if (isAnalytics) {
                    updateSet.expires_at = new Date(completedAt.getTime() + 7 * 24 * 3600 * 1000);
                } else {
                    updateSet.updated_at = completedAt;
                }

                await trx
                    .updateTable(tableName as any)
                    .set(updateSet)
                    .where(idCol as any, '=', exportId)
                    .execute();
            });

            // 7. Audit log success if institution-scoped
            if (exportRecord.institution_id) {
                try {
                    await LogsService.createLog(dbClient, {
                        userId: exportRecord.created_by || 'system-worker',
                        action: 'PDF_EXPORT_COMPLETED',
                        activeInstitutionId: exportRecord.institution_id,
                        details: {
                            exportId,
                            documentKind,
                            sizeBytes: pdfBuffer.length,
                        },
                    });
                } catch (logErr: any) {
                    console.warn(
                        `[PDFWorker] Audit logging failed for export ${exportId}:`,
                        logErr.message,
                    );
                }
            } else {
                console.log(`[PDFWorker] PDF_EXPORT_COMPLETED for global export ${exportId}`);
            }
        } catch (error: any) {
            const isUnrecoverable = error instanceof UnrecoverableError;
            const status = 'FAILED';

            await executeTransaction(async (trx) => {
                const updateSet: any = {
                    status,
                    failure_code: isUnrecoverable ? 'UNRECOVERABLE_ERROR' : 'TRANSIENT_ERROR',
                    failure_message: error.message || 'Unknown processing failure.',
                };
                if (!isAnalytics) {
                    updateSet.updated_at = new Date();
                }

                await trx
                    .updateTable(tableName as any)
                    .set(updateSet)
                    .where(idCol as any, '=', exportId)
                    .execute();
            });

            // Log event if institution-scoped
            if (exportRecord.institution_id) {
                try {
                    await LogsService.createLog(dbClient, {
                        userId: exportRecord.created_by || 'system-worker',
                        action: 'PDF_EXPORT_FAILED',
                        activeInstitutionId: exportRecord.institution_id,
                        details: {
                            exportId,
                            error: error.message,
                            unrecoverable: isUnrecoverable,
                        },
                    });
                } catch (logErr: any) {
                    console.warn(
                        `[PDFWorker] Audit logging failed for failed export ${exportId}:`,
                        logErr.message,
                    );
                }
            } else {
                console.error(
                    `[PDFWorker] PDF_EXPORT_FAILED for global export ${exportId}:`,
                    error.message,
                );
            }

            throw error;
        }
    }
}
