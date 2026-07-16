import { Queue } from 'bullmq';
import { createRedisConnection, closeRedisConnection } from '../../../../lib/redis/redis.service';
import { PDF_QUEUE_NAME, getPdfJobOptions } from './pdf-generation-queue.config';

export class PdfGenerationQueueService {
    private queue: Queue | null = null;
    private queueConnection: any = null;

    /**
     * Lazily creates and returns the BullMQ Queue instance.
     */
    async getQueue(): Promise<Queue> {
        if (!this.queue) {
            this.queueConnection = createRedisConnection('producer');
            this.queue = new Queue(PDF_QUEUE_NAME, {
                connection: this.queueConnection,
                defaultJobOptions: getPdfJobOptions()
            });
        }
        return this.queue;
    }

    /**
     * Queues a PDF generation background job. Uses the export UUID as the jobId
     * to prevent duplicate concurrent generation requests for the same artifact.
     * 
     * @param exportId unique PDF export document ID
     * @param documentKind type of document being generated
     */
    async submitPdfJob(exportId: string, documentKind: 'ANALYTICS_OVERALL' | 'EXAM_ANSWER_KEY'): Promise<void> {
        const queue = await this.getQueue();
        await queue.add('generate-pdf', { exportId, documentKind }, {
            jobId: exportId
        });
    }

    /**
     * Closes the queue connection gracefully.
     */
    async close(): Promise<void> {
        if (this.queue) {
            await this.queue.close();
            this.queue = null;
        }
        if (this.queueConnection) {
            await closeRedisConnection(this.queueConnection);
            this.queueConnection = null;
        }
    }
}

export const pdfGenerationQueueService = new PdfGenerationQueueService();
