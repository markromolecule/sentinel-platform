import {
    startPdfGenerationWorker,
    stopPdfGenerationWorker,
} from './modules/general/pdf-documents/queue/pdf-generation.worker';

// Start the worker process
startPdfGenerationWorker().catch((err) => {
    console.error('Fatal error starting PDF Worker process:', err);
    process.exit(1);
});

// Graceful shutdown handling
const shutdown = async () => {
    console.log('Shutting down PDF Worker process...');
    try {
        await stopPdfGenerationWorker();
    } catch (err: any) {
        console.error('Error stopping PDF Worker process:', err?.message || err);
    }
    process.exit(0);
};

process.on('SIGTERM', () => {
    void shutdown();
});

process.on('SIGINT', () => {
    void shutdown();
});
