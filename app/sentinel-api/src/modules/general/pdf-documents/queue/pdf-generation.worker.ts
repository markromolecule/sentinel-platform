import { Worker, Job } from 'bullmq';
import { dbClient } from '@sentinel/db';
import { createRedisConnection, closeRedisConnection } from '../../../../lib/redis/redis.service';
import { PDF_QUEUE_NAME, getPdfGenerationMode } from './pdf-generation-queue.config';
import { PdfGenerationJobProcessor } from './pdf-generation-job-processor.service';

let worker: Worker | null = null;
let workerConnection: any = null;

/**
 * Initializes and starts the background BullMQ Worker for PDF generation.
 * Handles jobs concurrently (concurrency 2) and locks connections gracefully.
 */
export async function startPdfGenerationWorker(): Promise<Worker | null> {
    if (worker) return worker;

    if (getPdfGenerationMode() !== 'redis') {
        console.log(
            `[PDFWorker] PDF generation mode is set to "${getPdfGenerationMode()}". PDF worker is inactive.`,
        );
        return null;
    }

    workerConnection = createRedisConnection('worker');

    worker = new Worker(
        PDF_QUEUE_NAME,
        async (
            job: Job<{ exportId: string; documentKind: 'ANALYTICS_OVERALL' | 'EXAM_ANSWER_KEY' }>,
        ) => {
            const { exportId, documentKind } = job.data;
            console.log(`[PDFWorker] Processing job ${job.id} for export ${exportId}`);

            try {
                await PdfGenerationJobProcessor.processJob(dbClient, exportId, documentKind);
                console.log(`[PDFWorker] Successfully completed export ${exportId}`);
            } catch (err: any) {
                console.error(`[PDFWorker] Failed processing export ${exportId}:`, err.message);
                throw err;
            }
        },
        {
            connection: workerConnection,
            concurrency: 2,
            lockDuration: 60000, // 60 seconds lock duration
        },
    );

    worker.on('failed', (job, err) => {
        console.error(`[PDFWorker] Job ${job?.id} failed with error:`, err.message);
    });

    console.log('[PDFWorker] Background PDF Generation Worker started successfully.');
    return worker;
}

/**
 * Shuts down the worker and its Redis connections.
 */
export async function stopPdfGenerationWorker(): Promise<void> {
    if (worker) {
        await worker.close();
        worker = null;
    }
    if (workerConnection) {
        await closeRedisConnection(workerConnection);
        workerConnection = null;
    }
    console.log('[PDFWorker] Background PDF Generation Worker stopped.');
}
