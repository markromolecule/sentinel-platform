import {
    startAiGenerationWorker,
    stopAiGenerationWorker,
} from '../modules/integrations/gemini/queue/ai-generation.worker';

// Start the dedicated AI generation worker process
startAiGenerationWorker().catch((err) => {
    console.error('[AiWorkerProcess] Fatal error starting AI Generation Worker process:', err);
    process.exit(1);
});

// Graceful shutdown handling
const shutdown = async () => {
    console.log('[AiWorkerProcess] Shutting down AI Generation Worker process...');
    try {
        await stopAiGenerationWorker();
    } catch (err: any) {
        console.error('[AiWorkerProcess] Error stopping AI Generation Worker process:', err?.message || err);
    }
    process.exit(0);
};

process.on('SIGTERM', () => {
    void shutdown();
});

process.on('SIGINT', () => {
    void shutdown();
});
