import { startPdfGenerationWorker } from './modules/general/pdf-documents/queue/pdf-generation.worker';

// Start the worker process
startPdfGenerationWorker().catch((err) => {
    console.error('Fatal error starting PDF Worker process:', err);
    process.exit(1);
});

// Graceful shutdown handling
const shutdown = async () => {
    console.log('Shutting down PDF Worker process...');
    process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
